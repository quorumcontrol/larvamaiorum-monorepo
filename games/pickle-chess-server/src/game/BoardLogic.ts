import { AStarFinder } from "astar-typescript"
import { IPoint } from "astar-typescript/dist/interfaces/astar.interfaces"
import { PickleChessState, Tile, TileType } from "../rooms/schema/PickleChessState"
import { RawBoard } from "./boardFetching"
import { randomInt } from "./utils/randoms"

const tileFloor = (num:number) => {
  return Math.max(0, Math.round(num))
}

class BoardLogic {
  private state: PickleChessState

  private tiles: Tile[][]

  private aStar?: AStarFinder

  constructor(state: PickleChessState) {
    this.tiles = []
    this.state = state
  }

  getTile(x: number, y: number) {
    return this.tiles[tileFloor(y)][tileFloor(x)]
  }

  findPath(from:IPoint, to:IPoint) {
    if (!this.aStar) {
      throw new Error("no aStar, but finding path")
    }
    return this.aStar.findPath(from, to)
  }

  populateTileMap(board: RawBoard) {
    for (let y = 0; y < board.length; y++) {
      this.tiles[y] = []
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
        this.tiles[y][x] = tile
      }
    }
    this.aStar = new AStarFinder({
      grid: {
        matrix: this.tiles.map((row) => row.map((tile) => {
          if ([TileType.water, TileType.stone].includes(tile.type)) {
            return 1
          }
          return 0
        })) 
      },
      diagonalAllowed: false,
      includeEndNode: true,
      includeStartNode: false,
    });
  }

  randomBoardLocation() {
    const y = randomInt(this.tiles.length)
    const x = randomInt(this.tiles[0].length)
    return { x, y }
  }

  randomReachableBoardLocation():Tile {
    const location = this.randomBoardLocation()
    const tile = this.getTile(location.x, location.y)
    if ([TileType.stone, TileType.water].includes(tile.type)) {
      return this.randomReachableBoardLocation()
    }
    return tile
  }



}

export default BoardLogic
