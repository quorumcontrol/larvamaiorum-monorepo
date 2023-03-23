import { Client, Room } from "colyseus.js";
import { Entity, RaycastResult } from "playcanvas";
import { SELECT_EVT } from "../controls/CellSelector";
import CharacterVisual from "../game/CharacterVisual";
import TileVisual from "../game/Tile";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { createScript } from "../utils/createScriptDecorator";
import { memoize } from "../utils/memoize";
import mustFindByName from "../utils/mustFindByName";
import mustGetScript from "../utils/mustGetScript";
import { Character, CharacterRemoveMessage, HudTextMessage, LatencyCheckMessage, Messages, PickleChessState, RoomState, TauntMessage, Tile, tileTypeToEnglish } from "./schema/PickleChessState";

const ROOM_TYPE = "PickleChessRoom"

const client = memoize(() => {
  if (typeof document !== 'undefined') {
    const params = new URLSearchParams(document.location.search);
    if (params.get('arena')) {
      return new Client("wss://pyy9eo.us-west-1.colyseus.dev")
    }
  }
  return new Client("ws://localhost:2567")
})

const roomParams = () => {
  if (typeof document !== 'undefined') {
    const params = new URLSearchParams(document.location.search);
    const encodedMatchData = params.get("m")
    if (encodedMatchData) {
      const matchData = JSON.parse(atob(encodedMatchData))
      return [matchData.roomType || ROOM_TYPE, matchData]
    }
    return [ROOM_TYPE, { name: params.get("name") }]
  }
  return [ROOM_TYPE, {}]
}

@createScript("networkManager")
class NetworkManager extends ScriptTypeBase {

  private client: Client
  private room: Room<PickleChessState>

  private latencyCheckInterval: ReturnType<typeof setInterval>

  private latencyMeasurements:number[]

  private currentLatency: number = 50 // ms

  initialize() {
    this.latencyMeasurements = []
    this.client = client()
    const playButton = mustFindByName(this.app.root, "PlayButton")

    playButton.element!.once("mousedown", () => {
      playButton.enabled = false
      this.go()
    })
    playButton.element!.once("touchstart", () => {
      playButton.enabled = false
      this.go()
    })
    this.app.on(SELECT_EVT, this.handleLocalCellSelect, this)
  }

  private isCharacterSelected() {
    const player = this.room.state.players.get(this.room.sessionId)
    return player && !!player.highlightedCharacterId
  }

  private handleLocalCellSelect(results: RaycastResult[]) {
    if (this.room?.state?.roomState !== RoomState.playing) {
      return
    }
    const isCharacterSelected = this.isCharacterSelected()

    let result: RaycastResult | undefined
    
    // first see if we can find a character if the user hasn't already selected one.
    if (!isCharacterSelected) {
      result = results.find((result) => {
        if (!result.entity.tags.has("character")) {
          return false
        }
        return mustGetScript<CharacterVisual>(result.entity, "character").playerId() === this.room.sessionId
      })
    }

    // then we see if we can find a tile (assuming no character)
    if (!result) {
      result = results.find((result) => {
        return result.entity.tags.has("tile")
      })
    }

    // and if none of those, we bail
    if (!result) {
      return
    }

    const entity = result.entity
    if (entity.tags.has("tile")) {
      const x = entity.name.split("-")[1]
      const y = entity.name.split("-")[2]
      console.log("cell select, entity", x, y, entity.name)
      this.room.send(Messages.tileClick, { x, y })
      return
    }
    if (entity.tags.has("character")) {
      console.log("character select, entity", entity.name)
      this.room.send(Messages.characterClick, { id: entity.name })
      return
    }
  }

  async go() {
    const [roomType, params] = roomParams()
    console.log("joining room: ", roomType, params)
    this.room = await this.client.joinOrCreate<PickleChessState>(roomType, params)

    this.room.onMessage(Messages.latencyCheck, (msg:LatencyCheckMessage) => {
      const latency = (new Date().getTime() - msg.sentAt) / 2
      this.latencyMeasurements.push(latency)
      if (this.latencyMeasurements.length > 5) {
        this.latencyMeasurements.shift()
      }
      this.currentLatency = this.latencyMeasurements.reduce((sum, measurement) => sum + measurement, 0) / this.latencyMeasurements.length
      console.log("latency: ", this.currentLatency)
      this.app.fire("latencyUpdate", this.currentLatency)
    })

    this.latencyCheckInterval = setInterval(() => {
      this.room.send(Messages.latencyCheck, { sentAt: new Date().getTime() })
    }, 5000)

    this.room.onMessage(Messages.taunt, (msg:TauntMessage) => {
      this.app.fire(Messages.taunt, msg)
    })

    this.room.onError((error) => {
      console.error("room error", error)
    })
    this.room.onLeave((code) => {
      console.info("room leave", code)
    })
    this.room.state.board.onAdd = this.handleTileAdd.bind(this)
    this.room.state.board.onRemove = this.handleTileRemove.bind(this)

    this.room.state.characters.onAdd = this.handleCharacterAdd.bind(this)
    this.room.state.characters.onRemove = this.handleCharacterRemove.bind(this)
    this.room.onMessage(Messages.hudText, (msg:HudTextMessage) => {
      this.app.fire(Messages.hudText, msg)
    })

    this.app.fire("latencyUpdate", this.currentLatency)

    console.log("new room!", this.room.state.toJSON())
    this.app.fire("newRoom", this.room)
  }

  private handleCharacterRemove(_characterState: Character, id: string) {
    const character = mustFindByName(this.app.root, id)
    const script = mustGetScript<CharacterVisual>(character, "character")
    script.kill()
    const playerId = script.playerId()
    this.app.fire(Messages.characterRemove, { id, playerId } as CharacterRemoveMessage)
    this.app.fire("camera:shake")
  }

  private handleCharacterAdd(characterState: Character, id: string) {
    const templates = mustFindByName(this.app.root, "Templates")
    const characterTemplate = mustFindByName(templates, "Character") as Entity
    const boardElement = mustFindByName(this.app.root, "Board")
    // const tileHolder = mustFindByName(boardElement, "Tiles")

    const character = characterTemplate.clone()
    character.name = characterState.id
    character.enabled = true
    const { x, z } = characterState.locomotion.position
    mustGetScript<CharacterVisual>(character, "character").setCharacter(characterState)
    character.setLocalPosition(x, 0, z)
    boardElement.addChild(character)
  }

  private handleTileAdd(tile: Tile, id: string) {
    // console.log("tile added", tile.toJSON(), id)
    const boardElement = mustFindByName(this.app.root, "Board")
    const tileHolder = mustFindByName(boardElement, "Tiles")
    const templates = mustFindByName(this.app.root, "Templates")
    const tileTemplate = mustFindByName(templates, "Tile") as Entity
    const tileEntity = tileTemplate.clone()

    tileEntity.name = tile.id
    tileEntity.enabled = true
    tileHolder.addChild(tileEntity)
    mustGetScript<TileVisual>(tileEntity, "tile").setTile(tile, this.room.sessionId)
  }

  private handleTileRemove(_tile: Tile, id: string) {
    const tileEntity = mustFindByName(this.app.root, id)
    tileEntity.destroy()
  }


}

export default NetworkManager
