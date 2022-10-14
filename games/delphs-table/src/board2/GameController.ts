import { Entity } from "playcanvas";
import { deterministicRandom } from "../boardLogic/random";
import { ScriptTypeBase } from "../types/ScriptTypeBase";

import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";
import PlayerLogic from "./PlayerLogic";
import TileLogic from './TileLogic'

interface WarriorSetup {
  tile: [number,number]
  name: string
}

interface BoardSetup {
  tiles: [number,number]
  seed: string
  warriors: WarriorSetup[]
}

@createScript("gameController")
class GameController extends ScriptTypeBase {

  templates: Entity
  board:Entity
  playerTemplate: Entity

  initialize() {
    console.log(' game controller ')
    this.templates = mustFindByName(this.app.root, 'Templates')
    this.templates.enabled = false

    const tile = mustFindByName(this.templates, 'Tile')
    const player = mustFindByName(tile, 'Player')
    this.playerTemplate = player.clone() as Entity
    player.destroy()

    this.board = mustFindByName(this.app.root, 'Board')
    console.log('found templates -hi')
    const boardSize = 8
    this.setupBoard({
      tiles: [boardSize,boardSize],
      seed: 'test',
      warriors: Array(boardSize).fill(true).map((_,i) => {
        return {
          tile: [deterministicRandom(boardSize, `${i}-warrior-x`, 'test'), deterministicRandom(boardSize, `${i}-warrior-y`, 'test')],
          name: `warrior ${i}`
        }
      })
    })
  }

  setupBoard(board:BoardSetup) {
    this.setupTiles(board)
    this.setupWarriors(board)
  }

  private setupWarriors(board:BoardSetup) {
    board.warriors.forEach((w) => {
      const player = this.playerTemplate.clone() as Entity
      this.board.addChild(player)
      const script = this.getScript<PlayerLogic>(player, 'playerLogic')!
      script.initialSetup(w)
    })
  }

  private setupTiles(board:BoardSetup) {
    const tileTemplate = mustFindByName(this.templates, 'Tile')
    console.log("tile template: ", tileTemplate)
    const { x:sizeX, z:sizeY } = mustFindByName(tileTemplate, 'BaseTile').render!.meshInstances[0].aabb.halfExtents;

    for (let y = 0; y < board.tiles[1]; y++) {
      for (let x = 0; x < board.tiles[0]; x++) {
        const tile = tileTemplate.clone() as Entity
        tile.name = `${x},${y}`
        console.log('size x: ', sizeX)
        const xOffset = (y % 2 === 1) ? (sizeX - 0.2) : 0.15
        // const xOffset = -0.5;
        tile.setPosition(
          (x * sizeX * 2) - xOffset,
          0,
          y * (sizeY * 1.5),
        )
        this.board.addChild(tile)
        const tileLogic = this.getScript<TileLogic>(tile, 'tileLogic')
        tileLogic?.initialSetup({
          tile: [x,y],
          seed: board.seed,
        })
      }
    }
    this.board.setLocalPosition((-1 * (sizeX - 0.15) * (board.tiles[0] - 1)) + (sizeX/2 * board.tiles[1] / 4),0, -0.75 * sizeY * (board.tiles[1] - 1))
  }
}

export default GameController