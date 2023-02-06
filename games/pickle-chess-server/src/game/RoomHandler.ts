import { Client } from "colyseus";
import { PickleChessRoom } from "../rooms/PickleChessRoom";
import { Character, Messages, PickleChessState, Player, RoomState, SetDestinationMessage, Tile, TileClickmessage, TileType } from "../rooms/schema/PickleChessState";
import { getAiBoard } from "./boardFetching";
import CharacterLogic from "./CharacterLogic";
import { randomInt } from "./utils/randoms";

const CHARACTERS_PER_PLAYER = 8
const NUMBER_OF_PLAYERS = 2

const tileFloor = (num:number) => {
  return Math.max(0, Math.round(num))
}

export interface RoomJoinOptions {
  name: string
  avatar?: string
}

class RoomHandler {
  private room: PickleChessRoom
  private state: PickleChessState

  private characters: CharacterLogic[]

  private board: Tile[][]

  constructor(room: PickleChessRoom) {
    this.room = room
    this.state = room.state
    this.board = []
    this.characters = []
  }

  update(dt: number) {
    this.characters.forEach((character) => {
      character.update(dt)
      const position = character.position()
      const tile = this.board[tileFloor(position.z)][tileFloor(position.x)]
      if (!tile) {
        console.error("no tile for ", Math.floor(position.z), Math.floor(position.x))
        return
      }
      if (character.state.tileId !== tile.id) {
        console.log(position.toJSON())
        console.log("character moved to tile", tile.id, "from", character.state.tileId)
      }
      character.state.tileId = tile.id
    })
  }

  setup() {
    this.populateTileMap()
    this.room.onMessage(Messages.setDestination, this.handleSetDestination.bind(this))
    this.room.onMessage(Messages.tileClick, this.handleTileClick.bind(this))
  }

  private handleSetDestination(client: Client, message: SetDestinationMessage) {
    console.log(client.sessionId, "set destination", message);
  }

  private handleTileClick(client: Client, {x,y}: TileClickmessage) {
    console.log(client.sessionId, "clicked tile", x,y);
    const tile = this.board[y][x]
    if (!tile) {
      console.error("Tile not found", x,y)
      return
    }
    const player = this.state.players.get(client.sessionId)
    if (!player) {
      console.error("Player not found", client.sessionId)
      return
    }
    const highlightedCharacterId = player.highlightedCharacterId
    if (highlightedCharacterId) {
      const character = this.characters.find((character) => character.state.id === highlightedCharacterId)
      character!.setDestination(tile)
      character.state.highlightedForPlayer.set(client.sessionId, false)
      player.highlightedCharacterId = ""
    }

    // find the player character on this tile if any
    const character = this.characters.find((character) => character.state.tileId === tile.id && character.state.playerId === client.sessionId)
    if (character) {
      character.state.highlightedForPlayer.set(client.sessionId, true)
      this.state.players.get(client.sessionId).highlightedCharacterId = character.state.id
    }
  }

  private playerCount() {
    return this.state.players.size
  }

  handlePlayerJoin(client: Client, options: RoomJoinOptions) {
    console.log(client.sessionId, "joined!");
    this.state.players.set(client.sessionId, new Player({
      id: client.sessionId,
      name: options.name,
    }))
    for (let i = 0; i < CHARACTERS_PER_PLAYER; i++) {
      const tile = this.randomReachableBoardLocation()
      const character = new Character({
        id: `${client.sessionId}-${i}`,
        playerId: client.sessionId,
        tileId: tile.id,
      })
      character.locomotion.assign({
        walkSpeed: 2.0,
      })
      character.locomotion.position.assign({
        x: tile.x,
        z: tile.y,
      })
      character.locomotion.destination.assign({
        x: tile.x,
        z: tile.y,
      })
      this.state.characters.set(character.id, character)
      this.characters.push(new CharacterLogic(character, this.room))
    }
    if (this.playerCount() >= NUMBER_OF_PLAYERS) {
      this.room.lock()
      this.state.roomState = RoomState.playing
    }
  }

  private randomBoardLocation() {
    const y = randomInt(this.board.length)
    const x = randomInt(this.board[0].length)
    return { x, y }
  }

  private randomReachableBoardLocation():Tile {
    const location = this.randomBoardLocation()
    const tile = this.board[location.y][location.x]
    if ([TileType.stone, TileType.water].includes(tile.type)) {
      return this.randomReachableBoardLocation()
    }
    return tile
  }

  private async populateTileMap() {
    const board = await getAiBoard()
    for (let y = 0; y < board.length; y++) {
      this.board[y] = []
      for (let x = 0; x < board[y].length; x++) {
        const tileType = board[y][x]
        const id = `tile-${x}-${y}`
        const tile = new Tile({
          id,
          x,
          y,
          type: tileType,
        })
        this.state.board.set(id, tile)
        this.board[y][x] = tile
      }
    }
  }


}

export default RoomHandler
