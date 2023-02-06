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
import { randomBounded } from "../utils/randoms";
import { Character, Messages, PickleChessState, Tile, tileTypeToEnglish } from "./schema/PickleChessState";

const ROOM_TYPE = "PickleChessRoom"

const client = memoize(() => {
  if (typeof document !== 'undefined') {
    const params = new URLSearchParams(document.location.search);
    if (params.get('arena')) {
      return new Client("wss://zh8smr.colyseus.de")
    }
  }
  return new Client("ws://localhost:2567")
})

const roomParams = () => {
  if (typeof document !== 'undefined') {
    const params = new URLSearchParams(document.location.search);
    const encodedMatchData = params.get("m")
    if (encodedMatchData) {
      return [ROOM_TYPE, JSON.parse(atob(encodedMatchData))]
    }
    return [ROOM_TYPE, { name: params.get("name") }]
  }
  return [ROOM_TYPE, {}]
}

@createScript("networkManager")
class NetworkManager extends ScriptTypeBase {

  private client:Client
  private room:Room<PickleChessState>

  initialize() {
    this.client = client()
    const playButton = mustFindByName(this.app.root, "PlayButton")

    playButton.element!.once("mousedown", () => {
      playButton.enabled = false
      this.go()
    })
    this.app.on(SELECT_EVT, this.handleLocalCellSelect, this)
  }

  private handleLocalCellSelect(result: RaycastResult) {
    const entity = result.entity
    console.log("click", entity.name)
    if (!entity.name?.startsWith("tile-")) {
      console.log('ignoring')
      return
    }
    const x = entity.name.split("-")[1]
    const y = entity.name.split("-")[2]
    console.log("cell select, entity", x, y, entity.name)
    this.room.send(Messages.tileClick , {x, y})
  }

  async go() {
    const [roomType, params] = roomParams()
    console.log("joining room: ", roomType, params)
    this.room = await this.client.joinOrCreate<PickleChessState>(roomType, params)

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


    console.log("new room!", this.room.state.toJSON())
    this.app.fire("newRoom", this.room)
  }

  private handleCharacterRemove(_characterState:Character, id:string) {
    //TODO: effects and stuff
    const character = mustFindByName(this.app.root, id)
    character.destroy()
  }

  private handleCharacterAdd(characterState:Character, id:string) {
    const templates = mustFindByName(this.app.root, "Templates")
    const characterTemplate = mustFindByName(templates, "Character") as Entity
    const boardElement = mustFindByName(this.app.root, "Board")
    // const tileHolder = mustFindByName(boardElement, "Tiles")

    const character = characterTemplate.clone()
    character.name = characterState.id
    character.enabled = true
    const {x, z} = characterState.locomotion.position
    mustGetScript<CharacterVisual>(character, "character").setCharacter(characterState, this.room.sessionId)
    character.setLocalPosition(x, 0, z)
    boardElement.addChild(character)
  }

  private handleTileAdd(tile:Tile, id:string) {
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

  private handleTileRemove(_tile:Tile, id:string) {
    const tileEntity = mustFindByName(this.app.root, id)
    tileEntity.destroy()
  }


}

export default NetworkManager
