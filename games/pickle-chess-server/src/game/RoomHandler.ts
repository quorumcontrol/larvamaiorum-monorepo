import { Client } from "colyseus"
import { PickleChessRoom } from "../rooms/PickleChessRoom"
import { Character, CharacterClickMessage, Messages, PickleChessState, Player, RoomState, TauntMessage, Tile, TileClickmessage } from "../rooms/schema/PickleChessState"
import { getAiBoard, RawBoard } from "./boardFetching"
import BoardLogic from "./BoardLogic"
import CharacterLogic from "./CharacterLogic"
import EventEmitter from "events"
import { getRandomTrack } from "./music"
import { GameEvent, GameState, getTaunt } from "../ai/taunt"
import { AIBrain, AIGameAction } from "../ai/gamePlayer"
import { speak } from "../ai/uberduck"

const AI_NAMES = [
  // "Locally"
  "alice",
  "bob",
  "charlie",
  "dave",
]

const AI_AVATARS = [
  // "http://localhost:8000/glb/femaledefault.glb",
  "https://models.readyplayer.me/63d1831323fe23d34bf68a80.glb",
  "https://models.readyplayer.me/63c27bf8e5b9a435587fc9f7.glb",
  "https://models.readyplayer.me/63c282c6e5b9a435587fcf53.glb",
  "https://models.readyplayer.me/639c401aad3d7939dd3cb573.glb",
]

const CHARACTERS_PER_PLAYER = 8
// const NUMBER_OF_PLAYERS = 2

const BOARD_LOAD_EVENT = "boardLoaded"

const MIN_TIME_BETWEEN_TAUNTS = 5
const MAX_TIME_BETWEEN_TAUNTS = 45

const TIME_BETWEEN_AI_MOVES = 0.75

export interface RoomJoinOptions {
  name: string
  avatar?: string
  numberOfAi?: number
  numberOfHumans: number
}

interface HistoryEntry {
  time: number
  event: {
    type: GameEvent,
    announcer: string,
  }
}

class RoomHandler extends EventEmitter {
  private room: PickleChessRoom
  private state: PickleChessState

  private characters: CharacterLogic[]

  board: BoardLogic<CharacterLogic>

  private boardLoaded = false
  private timeSinceMusic = 0
  private tauntFetching = false

  private gameClock = 0
  private timeSincePieceCapture = 0
  private timeSinceTaunt = MIN_TIME_BETWEEN_TAUNTS + 1 // start off the game with a taunt

  private aiBrains?: AIBrain[]
  private timeSinceAIMove = TIME_BETWEEN_AI_MOVES + 1 // start the game off with an AI move
  private isAiMoving = false

  private options: RoomJoinOptions

  private clients: Record<string, Client>
  private history: HistoryEntry[]

  constructor(room: PickleChessRoom, opts: RoomJoinOptions) {
    super()
    this.room = room
    this.state = room.state
    this.characters = []
    this.board = new BoardLogic(this.characters)
    this.options = opts
    this.options.numberOfAi ||= 0
    this.clients = {}
    this.history = []
  }

  update(dt: number) {
    this.characters.forEach((character) => {
      character.update(dt)
    })
    if (this.state.roomState !== RoomState.playing) {
      return
    }
    this.gameClock += dt
    this.timeSincePieceCapture += dt
    this.timeSinceTaunt += dt


    if (this.aiBrains) {
      this.timeSinceAIMove += dt
      if (this.timeSinceAIMove >= TIME_BETWEEN_AI_MOVES) {
        this.moveAI()
      }
    }

    if (this.timeSinceTaunt > MAX_TIME_BETWEEN_TAUNTS) {
      this.shipTaunt(GameEvent.filler)
    }

    this.handleCharacterRemovals()
    this.checkForOver()
    this.timeSinceMusic += dt
    // try every 20s incase music is failing
    if (this.state.nowPlaying.duration === 0 && this.timeSinceMusic > 20) {
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
    this.state.assign({
      persistantMessage: "Minerva is creating the board.",
    })
    const rawBoard = await getAiBoard(this.expectedPlayerCount())
    const tiles = this.tileMap(rawBoard)
    this.board.populateTiles(tiles)
    tiles.forEach((tile) => this.state.board.set(tile.id, tile))

    this.room.onMessage(Messages.tileClick, this.handleTileClick.bind(this))
    this.room.onMessage(Messages.characterClick, this.handleCharacterClick.bind(this))
    this.boardLoaded = true
    this.emit(BOARD_LOAD_EVENT)
  }

  tileMap(board: RawBoard) {
    const allTiles: Tile[] = []
    for (let y = 0; y < board.length; y++) {
      for (let x = 0; x < board[y].length; x++) {
        const tileType = board[y][x]
        const id = `tile-${x}-${y}`
        const tile = new Tile({
          id,
          x,
          y,
          type: tileType,
        })
        allTiles.push(tile)
      }
    }
    return allTiles
  }

  private expectedPlayerCount() {
    return this.options.numberOfHumans + this.options.numberOfAi
  }

  private isPlaying() {
    return this.state.roomState === RoomState.playing
  }

  private handleAiMove(action: AIGameAction, id: string) {
    const tile = this.board.getTile(action.from.x, action.from.y)
    if (!tile) {
      console.error('AI tried to use a bad tile', action.from)
      return
    }
    const character = this.board.characterAt(tile)
    if (!character || character.playerId !== id) {
      console.error('AI tried to move a character that was not theirs', character)
      return
    }
    const destinationTile = this.board.getTile(action.to.x, action.to.y)
    if (!destinationTile) {
      console.error('AI tried to move to a bad tile', action.to)
      return
    }
    character.setDestination(destinationTile)
  }

  private async moveAI() {
    if (!this.aiBrains || this.isAiMoving) {
      // console.log("not moving AI: ", !!this.aiBrain, this.isAiMoving)
      return
    }
    try {
      this.isAiMoving = true
      // console.log("moving AI")
      await Promise.all(this.aiBrains.map(async (brain) => {
        if (this.board.isPlayerDead(brain.id)) {
          return
        }

        // take the top 3 actions on different tiles
        let actions = await brain.getActions(brain.id)
        actions.slice(0, 2).forEach((action, _i, actions) => {
          if (!action.to) {
            return
          }
          this.handleAiMove(action, brain.id)
          // filter out all actions that have the same to
          actions = actions.filter((a) => a.to.x !== action.to.x || a.to.y !== action.to.y)
        })
      }))
      this.timeSinceAIMove = 0
    } catch (err) {
      console.error("error moving AI: ", err)
      return
    } finally {
      this.isAiMoving = false
    }

  }

  checkForOver() {
    if (!this.boardLoaded) {
      return
    }

    if (this.board.isOver()) {
      console.log("------------------ game over!")
      this.state.assign({
        roomState: RoomState.gameOver,
        persistantMessage: "Game Over"
      })
      this.shipTaunt(GameEvent.over)
      console.log("current history", this.history)
    }
  }

  handleCharacterRemovals() {
    const deadPlayerIds = Array.from(Object.values(this.state.players)).filter((player) => this.board.isPlayerDead(player.id)).map((player) => player.id)
    // loop through all the characters, if any character is surrounded on two sides by an opponent's character, then remove it. If they are in a corner then they can be boxed in on one side.
    const toDelete: CharacterLogic[] = []

    this.characters.forEach((character) => {
      const playerId = character.state.playerId
      const { x, y } = character.position
      const playerTile = this.board.getTile(x, y)
      if (!playerTile) {
        console.error("tile not found", x, y)
        return
      }
      if (this.board.killsCharacter(playerTile, playerId, undefined, true) || deadPlayerIds.includes(playerId)) {
        toDelete.push(character)
      }
    })
    toDelete.forEach((character) => {
      character.stop()
      this.state.characters.delete(character.id)
      const idx = this.characters.indexOf(character)
      if (idx > -1) {
        const deleted = this.characters.splice(idx, 1)
        if (deleted.length !== 1) {
          console.error("deleted incorrect characters", deleted)
          throw new Error('oops')
        }
      } else {
        console.error("missing character")
        throw new Error("oops")
      }
      this.timeSincePieceCapture = 0
    })
    if (toDelete.length > 0) {
      const removedCounts = toDelete.reduce((acc, character) => {
        acc[character.playerId] = (acc[character.state.playerId] || 0) + 1
        return acc
      }, {} as { [key: string]: number })

      const evt = this.board.isOver() ? GameEvent.over : GameEvent.pieceCaptured
      this.shipTaunt(evt, Object.keys(removedCounts).map((playerId) => {
        const playerName = this.state.players.get(playerId)?.name || "unknown"
        return `${playerName} just lost ${removedCounts[playerName]} pieces`
      }).join(". "))

      Object.keys(removedCounts).forEach((playerId) => {
        const client = this.clients[playerId]
        if (client) {
          console.log("shipping hudTet")
          client.send(Messages.hudText, { text: `lost ${removedCounts[playerId]}` })
        }
      })

    }
  }

  private getGameState(event: GameEvent): GameState {
    const players = Array.from(this.state.players.values()).reduce((acc, player) => {
      acc[player.name] = {
        characters: this.characters.filter((character) => character.state.playerId === player.id).length
      }
      return acc
    }, {} as GameState["players"])
    const ranked = Object.keys(players).sort((a, b) => players[b].characters - players[a].characters)

    const winner = this.board.isOver() ? ranked[0] : undefined

    return {
      event,
      players,
      ranked: ranked,
      timeSincePieceCapture: this.timeSincePieceCapture,
      gameClock: this.gameClock,
      winner,
    }
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

  private handleTileClick(client: Client, { x, y }: TileClickmessage) {
    console.log(client.sessionId, "clicked tile", x, y);
    if (!this.isPlaying()) {
      console.log("not handling tile click")
      return
    }
    const tile = this.board.getTile(x, y)
    if (!tile) {
      console.error("Tile not found", x, y)
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

  private async shipTaunt(event: GameEvent, extraText?: string) {
    if (event !== GameEvent.filler) {
      this.history.push({
        time: new Date().getTime(),
        event: {
          type: event,
          announcer: "",
        }
      })
    }

    if (this.tauntFetching) { // || this.timeSinceTaunt <= MIN_TIME_BETWEEN_TAUNTS) {
      return
    }
    console.log("ship taunt: ", event, extraText)

    this.tauntFetching = true
    const taunt = await getTaunt(this.getGameState(event), extraText)
    if (taunt) {
      try {
        const audio = await speak(taunt)
        console.log("taunt", taunt)
        this.room.broadcast(Messages.taunt, { text: taunt, audio } as TauntMessage)
      } catch (err) {
        console.error('error speaking', err)
      }
    }
    if (event !== GameEvent.filler) {
      this.history[this.history.length - 1].event.announcer = taunt
    }

    this.tauntFetching = undefined
    this.timeSinceTaunt = 0
  }

  private startCountdown() {
    if (this.options.numberOfAi > 0) {
      for (let i = 0; i < this.options.numberOfAi; i++) {
        this.createAICharacter(i)
      }
    }
    let countdown = 10
    this.state.assign({
      persistantMessage: `${countdown}`,
      roomState: RoomState.countdown
    })
    this.shipTaunt(GameEvent.started)
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
        this.room.broadcast(Messages.hudText, { text: "GO!" }, { afterNextPatch: true })
      }
    }, 1000)
  }

  createAICharacter(idx: number) {
    const avatar = AI_AVATARS[idx]
    console.log("creating AI character:", AI_NAMES[idx])
    const id = `AI-${AI_NAMES[idx]}`
    this.state.players.set(id, new Player({
      id,
      name: AI_NAMES[idx],
      avatar: avatar,
    }))
    for (let i = 0; i < CHARACTERS_PER_PLAYER; i++) {
      const tile = this.board.randomAvailableInitialLocation(id)
      const character = new Character({
        id: `${id}-${i}`,
        playerId: id,
        tileId: tile.id,
        avatar: avatar,
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
    this.aiBrains ||= []
    this.aiBrains[idx] = new AIBrain(id, this.board, this.characters)
  }

  handlePlayerJoin(client: Client, options: RoomJoinOptions) {
    const handleJoin = () => {
      console.log(client.sessionId, "joined!", options);
      this.state.players.set(client.sessionId, new Player({
        id: client.sessionId,
        name: options.name,
        avatar: options.avatar,
      }))
      this.clients[client.sessionId] = client
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
      if (this.playerCount() >= this.options.numberOfHumans) {
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
