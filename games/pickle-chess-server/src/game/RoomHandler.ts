import { Client } from "colyseus"
import { PickleChessRoom } from "../rooms/PickleChessRoom"
import { Character, CharacterClickMessage, Messages, PickleChessState, Player, RoomState, SetDestinationMessage, TileClickmessage } from "../rooms/schema/PickleChessState"
import { getAiBoard } from "./boardFetching"
import BoardLogic from "./BoardLogic"
import CharacterLogic from "./CharacterLogic"
import EventEmitter from "events"
import { getRandomTrack } from "./music"

const CHARACTERS_PER_PLAYER = 8
const NUMBER_OF_PLAYERS = 2

const BOARD_LOAD_EVENT = "boardLoaded"

export interface RoomJoinOptions {
  name: string
  avatar?: string
}

class RoomHandler extends EventEmitter {
  private room: PickleChessRoom
  private state: PickleChessState

  private characters: CharacterLogic[]

  board: BoardLogic

  private boardLoaded = false
  private timeSinceMusic = 0

  constructor(room: PickleChessRoom) {
    super()
    this.room = room
    this.state = room.state
    this.board = new BoardLogic(this.state)
    this.characters = []
  }

  update(dt: number) {
    this.characters.forEach((character) => {
      character.update(dt)
    })
    if (this.state.roomState !== RoomState.playing) {
      return
    }
    this.handleCharacterRemovals()
    this.checkForOver()
    this.timeSinceMusic += dt
    // try every 20s incase music is failing
    if (this.state.nowPlaying.duration === 0 && this.timeSinceMusic > 20_000) {
      this.timeSinceMusic = 0
      this.setupMusic()
    }
    if (this.state.nowPlaying.duration > 0 && this.timeSinceMusic > this.state.nowPlaying.duration) {
      this.timeSinceMusic = 0
      this.setupMusic()
    }
  }

  async setup() {
    this.setupMusic()
    const rawBoard = await getAiBoard()
    this.board.populateTileMap(rawBoard)
    this.room.onMessage(Messages.setDestination, this.handleSetDestination.bind(this))
    this.room.onMessage(Messages.tileClick, this.handleTileClick.bind(this))
    this.room.onMessage(Messages.characterClick, this.handleCharacterClick.bind(this))
    this.boardLoaded = true
    this.emit(BOARD_LOAD_EVENT)
  }

  private isPlaying() {
    return this.state.roomState === RoomState.playing
  }

  checkForOver() {
    if (!this.boardLoaded) {
      return
    }
    // see if one player only has a single character left
    const players = this.state.players
    const playerIds = Array.from(players.keys())
    const playerCharacters = playerIds.map((playerId) => {
      return this.characters.filter((character) => character.state.playerId === playerId)
    })
    const playerWithOneCharacter = playerCharacters.find((characters) => characters.length <= 1)
    if (playerWithOneCharacter) {
      console.log("------------------ game over!")
      this.state.assign({
        winner: playerWithOneCharacter[0].state.playerId,
        roomState: RoomState.gameOver,
        persistantMessage: "Game Over"
      })
    }
  }

  handleCharacterRemovals() {
    // loop through all the characters, if any character is surrounded on two sides by an opponent's character, then remove it. If they are in a corner then they can be boxed in on one side.
    this.characters.forEach((character, i, characters) => {
      const playerId = character.state.playerId
      const {x,z} = character.position()
      const playerTile = this.board.getTile(x,z)
      if (!playerTile) {
        console.error("tile not found", x,z)
        return
      }
      if (this.board.killsPlayer(playerTile, playerId)) {
        character.stop()
        this.state.characters.delete(character.state.id)
        characters.splice(i, 1)
      }
    })
  }

  private async setupMusic() {
    const track = await getRandomTrack()
    if (track) {
      console.log('updating track to: ', track.title)
      this.state.nowPlaying.assign({
        name: track.title,
        duration: track.duration,
        artwork: track.artwork,
        artist: track.artist,
        url: track.streaming,
        startedAt: new Date().getTime(),
      })
    }
    this.timeSinceMusic = 0
  }

  private handleSetDestination(client: Client, message: SetDestinationMessage) {
    console.log(client.sessionId, "set destination", message);
  }

  private handleCharacterClick(client: Client, { id }: CharacterClickMessage) {
    console.log(client.sessionId, "clicked character", id);
    if (!this.isPlaying()) {
      console.log("not handling character click")
      return
    }
    const character = this.characters.find((character) => character.state.id === id)
    if (!character) {
      console.error("Character not found", id)
      return
    }
    const player = this.state.players.get(client.sessionId)
    if (!player) {
      console.error("Player not found", client.sessionId)
      return
    }
    
    if (character.state.playerId === player.id) {
      player.highlightedCharacterId = id
      character.state.highlightedForPlayer.set(client.sessionId, true)
      return
    }
  }

  private handleTileClick(client: Client, {x,y}: TileClickmessage) {
    console.log(client.sessionId, "clicked tile", x,y);
    if (!this.isPlaying()) {
      console.log("not handling tile click")
      return
    }
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
      if (!character) {
        player.highlightedCharacterId = ""
        return
      }
      character.setDestination(tile)
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

  private startCountdown() {
    let countdown = 15
    this.state.assign({
      persistantMessage: `${countdown}`,
      roomState: RoomState.countdown
    })
    const interval = this.room.clock.setInterval(() => {
      countdown--
      this.state.assign({
        persistantMessage: `${countdown}`,
      })
      if (countdown === 0) {
        interval.clear()
        this.state.assign({
          persistantMessage: "",
          roomState: RoomState.playing
        })
        this.room.broadcast(Messages.hudText, {text: "GO!"}, { afterNextPatch: true })
      }
    }, 1000)
  }

  handlePlayerJoin(client: Client, options: RoomJoinOptions) {
    const handleJoin = () => {
      console.log(client.sessionId, "joined!", options);
      this.state.players.set(client.sessionId, new Player({
        id: client.sessionId,
        name: options.name,
        avatar: options.avatar,
      }))
      for (let i = 0; i < CHARACTERS_PER_PLAYER; i++) {
        const tile = this.board.randomAvailableInitialLocation(client.sessionId)
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
        this.startCountdown()
      }
    }
    if (this.boardLoaded) {
      return handleJoin()
    }
    this.once(BOARD_LOAD_EVENT, handleJoin)
    
  }
}

export default RoomHandler
