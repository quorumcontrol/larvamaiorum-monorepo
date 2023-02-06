import { Client } from "colyseus";
import { PickleChessRoom } from "../rooms/PickleChessRoom";
import { Character, Messages, PickleChessState, Player, RoomState, SetDestinationMessage, Tile, TileClickmessage, TileType } from "../rooms/schema/PickleChessState";
import { getAiBoard } from "./boardFetching";
import BoardLogic from "./BoardLogic";
import CharacterLogic from "./CharacterLogic";

const CHARACTERS_PER_PLAYER = 8
const NUMBER_OF_PLAYERS = 2

export interface RoomJoinOptions {
  name: string
  avatar?: string
}

class RoomHandler {
  private room: PickleChessRoom
  private state: PickleChessState

  private characters: CharacterLogic[]

  private board: BoardLogic


  constructor(room: PickleChessRoom) {
    this.room = room
    this.state = room.state
    this.board = new BoardLogic(this.state)
    this.characters = []
  }

  update(dt: number) {
    this.characters.forEach((character) => {
      character.update(dt)
    })
  }

  async setup() {
    const rawBoard = await getAiBoard()
    this.board.populateTileMap(rawBoard)
    this.room.onMessage(Messages.setDestination, this.handleSetDestination.bind(this))
    this.room.onMessage(Messages.tileClick, this.handleTileClick.bind(this))
  }

  private handleSetDestination(client: Client, message: SetDestinationMessage) {
    console.log(client.sessionId, "set destination", message);
  }

  private handleTileClick(client: Client, {x,y}: TileClickmessage) {
    console.log(client.sessionId, "clicked tile", x,y);
    const tile = this.board.getTile(x,y)
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
      return
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
    console.log(client.sessionId, "joined!", options);
    this.state.players.set(client.sessionId, new Player({
      id: client.sessionId,
      name: options.name,
      avatar: options.avatar,
    }))
    for (let i = 0; i < CHARACTERS_PER_PLAYER; i++) {
      const tile = this.board.randomReachableBoardLocation()
      const character = new Character({
        id: `${client.sessionId}-${i}`,
        playerId: client.sessionId,
        tileId: tile.id,
        avatar: options.avatar,
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
      this.characters.push(new CharacterLogic(character, this.board))
    }
    if (this.playerCount() >= NUMBER_OF_PLAYERS) {
      this.room.lock()
      this.state.roomState = RoomState.playing
    }
  }
}

export default RoomHandler
