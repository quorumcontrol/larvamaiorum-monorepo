import { AStarFinder } from "astar-typescript"
import { IPoint } from "astar-typescript/dist/interfaces/astar.interfaces"
import { PickleChessState, Tile, TileType } from "../rooms/schema/PickleChessState"
import { RawBoard } from "./boardFetching"
import CharacterLogic from "./CharacterLogic"
import { randomInt } from "./utils/randoms"

const tileFloor = (num:number) => {
  return Math.max(0, Math.round(num))
}

class BoardLogic {
  private state: PickleChessState

  private tiles: Tile[][]

  constructor(state: PickleChessState) {
    this.tiles = []
    this.state = state
  }

  getOccupent(x: number, y: number) {
    const tile = this.getTile(x, y)
    return this.characterAt(tile)
  }

  characterAt(tile: Tile) {
    return Array.from(this.state.characters.values()).find((character) => character.tileId === tile.id)
  }

  isPassable(playerId: string, tile?: Tile) {
    if (!tile) {
      return false
    }
    if ([TileType.water, TileType.stone].includes(tile.type)) {
      return false
    }
    const character = this.characterAt(tile)
    if (character && character.playerId === playerId) {
      return false
    }
    return true
  }

  isOccupiedByOpposingPlayer(playerId:string, tile?:Tile) {
    if (!tile) {
      return false
    }
    const character = this.characterAt(tile)
    if (!character) {
      return false
    }

    return character.playerId !== playerId
  }
  
  getTile(x: number, y: number) {
    const column = this.tiles[tileFloor(y)] || []
    return column[tileFloor(x)]
  }

  findPath(from:IPoint, to:IPoint, movingCharacter:CharacterLogic) {
    const aStar = new AStarFinder({
      grid: {
        matrix: this.tiles.map((column) => column.map((tile) => {
          if ([TileType.water, TileType.stone].includes(tile.type)) {
            return 1
          }
          const character = this.characterAt(tile)
          if (character && character.id !== movingCharacter.state.id) {
            return 1
          }
          return 0
        })) 
      },
      diagonalAllowed: true,
      includeEndNode: true,
      includeStartNode: false,
    });
    return aStar.findPath(from, to)
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
  }

  randomBoardLocation() {
    const y = randomInt(this.tiles.length)
    const x = randomInt(this.tiles[0].length)
    return { x, y }
  }

  randomAvailableInitialLocation():Tile {
    const location = this.randomBoardLocation()
    const tile = this.getTile(location.x, location.y)
    if ([TileType.stone, TileType.water].includes(tile.type) || this.getOccupent(tile.x, tile.y)) {
      return this.randomAvailableInitialLocation()
    }
    return tile
  }



}

export default BoardLogic
