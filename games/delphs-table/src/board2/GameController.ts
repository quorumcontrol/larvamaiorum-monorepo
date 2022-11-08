import { Entity } from "playcanvas";
import { MESSAGE_EVENT } from "../appWide/AppConnector";
import { TickOutput } from "../boardLogic/Grid";
import { WarriorState } from "../boardLogic/Warrior";
import { ScriptTypeBase } from "../types/ScriptTypeBase";

import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";
import { SELECT_EVT } from "./CellSelector";
import PlayerLogic from "./PlayerLogic";
import { TestHarness } from "./test";
import TileLogic from './TileLogic'

interface BoardSetup {
  currentPlayer: string
  seed:string
  tableSize: number
  gameLength: number
  warriors?: WarriorState[]
}

export const TICK_EVT = 'tick'
export const PENDING_DESTINATION = 'pending_dest'
export const CARD_CLICK_EVT = 'card_click'
export const WARRIOR_SETUP_EVT = 'warrior-setup'
export const CARD_ERROR_EVT = 'card-error'
export const NO_MORE_MOVES_EVT = 'noMoreMoves'

export interface TickEvent {
  tick: TickOutput
  currentPlayer: string
  gameLength: number
  controller: GameController
}

@createScript("gameController")
class GameController extends ScriptTypeBase {

  templates: Entity
  board:Entity
  playerTemplate: Entity
  destinationMarker: Entity

  tiles:TileLogic[][]
  players:Record<string, PlayerLogic>
  gameLength: number
  currentPlayer: string

  harness?:TestHarness

  canSelect = true

  isBoardSetup = false
  areWarriorsSetup = false

  handledTicks: Record<number, boolean>

  initialize() {
    console.log(' game controller ')
    this.handledTicks = {}
    this.tiles = []
    this.players = {}
    this.templates = mustFindByName(this.app.root, 'Templates')
    this.templates.enabled = false

    this.destinationMarker = mustFindByName(this.templates, 'DestinationMarker')

    const tile = mustFindByName(this.templates, 'Tile')
    const player = mustFindByName(tile, 'Player')
    this.playerTemplate = player.clone() as Entity
    player.destroy()

    this.board = mustFindByName(this.app.root, 'Board')

    this.app.on(CARD_CLICK_EVT, this.handleCardClick, this)
    this.app.on(SELECT_EVT, this.handleSelect, this)
    this.app.on(MESSAGE_EVENT, this.handleExternalMessage, this)

    const urlParams = new URLSearchParams(window.location.search);
    const debug = urlParams.get("debug")
    
    if (debug) {
      console.log('-------------- starting test')
      const testHarness = new TestHarness(this)
      this.harness = testHarness
      testHarness.go()
    }
  }

  handleExternalMessage(msg:{type:string, data:any}) {
    switch(msg.type) {
      case 'setupBoard':
        return this.setupBoard(msg.data)
      case 'setupWarriors':
        return this.setupWarriors(msg.data)
      case 'tick':
        return this.handleTick(msg.data)
      case 'cardError':
        return this.handleCardError(msg.data)
      case NO_MORE_MOVES_EVT:
        this.canSelect = false
        return this.app.fire(NO_MORE_MOVES_EVT)
      default:
        console.log('msg: ', msg)
    }
  }

  pingExternal(type:string, data:any) {
    parent.postMessage(JSON.stringify({
      type,
      data,
    }), '*')
  }

  handleCardClick(name:string) {
    this.pingExternal(CARD_CLICK_EVT, { name })
  }

  handleCardError(_data:any) {
    this.app.fire(CARD_ERROR_EVT)
  }

  handleSelect(entity:Entity) {
    console.log('game controller select: ', entity, entity.name)
    if (entity.name == "PlayerPhysics") {
      const playerLogic = this.getScript<PlayerLogic>(entity.parent as Entity, 'playerLogic')
      if (!playerLogic) {
        throw new Error('no player logic')
      }
      playerLogic.toggleHover()
      return
    }
    if (this.canSelect) {
      const tileLogic = this.getScript<TileLogic>(entity, 'tileLogic')
      if (!tileLogic) {
        console.log('missing tile logic on selected entity')
        return
      }
      this.app.fire(PENDING_DESTINATION, tileLogic)
      this.pingExternal(PENDING_DESTINATION, { destination: [tileLogic.x, tileLogic.y] })
    }
  }

  update() {
    if (this.app.keyboard.wasPressed(pc.KEY_SPACE)) {
      if (this.harness) {
        this.harness.tick()
      }
    }
  }

  setupBoard(setupMessage:BoardSetup) {
    if (this.isBoardSetup) {
      console.error('already setup')
      return
    }
    this.isBoardSetup = true
    this.gameLength = setupMessage.gameLength
    this.currentPlayer = setupMessage.currentPlayer
    
    this.destinationMarker.enabled = !!this.currentPlayer

    this.setupTiles(setupMessage)
    if (setupMessage.warriors) {
      this.setupWarriors(setupMessage.warriors)
    }
  }

  setupWarriors(warriors:WarriorState[]) {
    if (this.areWarriorsSetup) {
      console.error("already setup warriors.")
      return
    }
    this.areWarriorsSetup = true

    warriors.forEach((w, i) => {
      const player = this.playerTemplate.clone() as Entity
      player.name = `warrior-${w.id}-${w.name.replaceAll(/\s\//g, '_')}`
      this.board.addChild(player)
      const script = this.getScript<PlayerLogic>(player, 'playerLogic')!
      this.players[w.id] = script
      script.initialSetup(w, this.currentPlayer)
    })
    this.app.fire(WARRIOR_SETUP_EVT, warriors)
  }

  handleTick(tick:TickOutput) {
    this.canSelect = true
    this.app.fire(TICK_EVT, {
      tick,
      gameLength: this.gameLength,
      currentPlayer: this.currentPlayer,
      controller: this
    } as TickEvent)

    if (this.handledTicks[tick.tick]) {
      console.error('already handled tick ', tick)
      return
    }
    this.handledTicks[tick.tick] = true

    tick.outcomes.forEach((row, x) => {
      row.forEach((outcome, y) => {
        const tile = this.tiles[x][y]
        tile.handleCellOutcome(outcome)
        outcome.incoming.forEach((w) => {
          this.players[w.id].moveTo(this.tiles[x][y])
        })
        outcome.battleTicks.forEach((battleTick) => {
          tile.handleBattle(battleTick)
          const warriorElements = battleTick.warriors.reduce((memo, warrior) => {
            return {
              ...memo,
              [warrior.id]: this.players[warrior.id]!
            }
          }, {} as Record<string,PlayerLogic>)
          battleTick.warriors.forEach((w) => {
            warriorElements[w.id].handleBattle(battleTick, tile, warriorElements)
          })
        })
      })
    })
    tick.ranked.forEach((warriorState) => {
      this.players[warriorState.id].handleStateUpdate(warriorState)
    })
  }

  private setupTiles(board:BoardSetup) {
    const tileTemplate = mustFindByName(this.templates, 'Tile')
    console.log("tile template: ", tileTemplate)
    const { x:sizeX, z:sizeY } = mustFindByName(tileTemplate, 'BaseTile').render!.meshInstances[0].aabb.halfExtents;

    for (let y = 0; y < board.tableSize; y++) {
      for (let x = 0; x < board.tableSize; x++) {
        const tile = tileTemplate.clone() as Entity
        tile.name = `${x},${y}`
        // const xOffset = (y % 2 === 1) ? (sizeX - 0.2) : 0.15
        const xOffset = 0
        tile.setPosition(
          (x * sizeX * 2) - xOffset,
          0,
          y * (sizeY * 2),
        )
        this.board.addChild(tile)
        const tileLogic = this.getScript<TileLogic>(tile, 'tileLogic')!

        this.tiles[x] ||= []
        this.tiles[x][y] = tileLogic
        tileLogic.initialSetup({
          tile: [x,y],
          seed: board.seed,
        })
      }
    }
    // this.board.setLocalPosition((-1 * (sizeX - 0.15) * (board.tiles[0] - 1)) + (sizeX/2 * board.tiles[1] / 4),0, -0.75 * sizeY * (board.tiles[1] - 1))
    this.board.setLocalPosition((-1 * (sizeX) * (board.tableSize)),0, -1 * sizeY * (board.tableSize))
  }
}

export default GameController