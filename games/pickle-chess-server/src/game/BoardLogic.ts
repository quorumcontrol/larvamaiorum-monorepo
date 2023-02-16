import { AStarFinder } from "astar-typescript"
import { IPoint } from "astar-typescript/dist/interfaces/astar.interfaces"
import { TileType } from "../rooms/schema/PickleChessState"
import CharacterLogic from "./CharacterLogic"
import { randomInt } from "./utils/randoms"

interface Character {
  id: string
  playerId: string
  tileId: string
  position: IPoint
}

export interface Tile {
  id: string
  type: TileType
  x: number
  y: number
}

class BoardLogic<CharacterType extends Character> {
  // private state: PickleChessState
  private characters: CharacterType[]

  tiles: Tile[][]

  constructor(characters: CharacterType[], tiles?: Tile[]) {
    if (tiles) {
      this.populateTiles(tiles)
    } else {
      this.tiles = []
    }
    this.characters = characters
    // this.state = state
  }

  populateTiles(tiles: Tile[]) {
    this.tiles = []
    tiles.forEach((tile) => {
      this.tiles[tile.y] ||= []
      this.tiles[tile.y][tile.x] = tile
    })
  }

  getOccupent(x: number, y: number) {
    const tile = this.getTile(x, y)
    return this.characterAt(tile)
  }

  characterAt(tile: Tile):CharacterType | undefined {
    return this.characters.find((character) => character.tileId === tile.id)
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

  isOccupiedByOpposingPlayer(playerId: string, tile?: Tile) {
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
    const column = this.tiles[Math.round(y)] || []
    return column[Math.round(x)]
  }

  findPath(from: IPoint, to: IPoint, movingCharacter: CharacterLogic) {
    const aStar = new AStarFinder({
      grid: {
        matrix: this.tiles.map((column) => column.map((tile) => {
          if ([TileType.water, TileType.stone].includes(tile.type)) {
            return 1
          }
          const character = this.characterAt(tile)
          if (character && character.id !== movingCharacter.id) {
            return 1
          }
          if (this.killsPlayer(tile, movingCharacter.playerId)) {
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


  killsPlayer(playerTile: Tile, playerId: string) {
    const { x, y } = playerTile
    // first find if the tile above and below is occupied by an opponent
    const tileAbove = this.getTile(x, y + 1)
    const tileBelow = this.getTile(x, y - 1)
    const tileLeft = this.getTile(x - 1, y)
    const tileRight = this.getTile(x + 1, y)

    if (tileAbove && tileBelow && this.isOccupiedByOpposingPlayer(playerId, tileAbove) && this.isOccupiedByOpposingPlayer(playerId, tileBelow)) {
      return true
    }

    if (tileLeft && tileRight && this.isOccupiedByOpposingPlayer(playerId, tileLeft) && this.isOccupiedByOpposingPlayer(playerId, tileRight)) {
      return true
    }

    // check for the corners of the board which would allow a top,left or a top, right, etc to remove a character.
    if (!this.isPassable(playerId, tileAbove) && !this.isPassable(playerId, tileLeft) && this.isOccupiedByOpposingPlayer(playerId, tileRight) && this.isOccupiedByOpposingPlayer(playerId, tileBelow)) {
      return true
    }

    if (!this.isPassable(playerId, tileAbove) && !this.isPassable(playerId, tileRight) && this.isOccupiedByOpposingPlayer(playerId, tileLeft) && this.isOccupiedByOpposingPlayer(playerId, tileBelow)) {
      return true
    }

    if (!this.isPassable(playerId, tileBelow) && !this.isPassable(playerId, tileLeft) && this.isOccupiedByOpposingPlayer(playerId, tileRight) && this.isOccupiedByOpposingPlayer(playerId, tileAbove)) {
      return true
    }

    if (!this.isPassable(playerId, tileBelow) && !this.isPassable(playerId, tileRight) && this.isOccupiedByOpposingPlayer(playerId, tileLeft) && this.isOccupiedByOpposingPlayer(playerId, tileAbove)) {
      return true
    }

    return false
  }

  isPlayerDead(playerId: string) {
    const characters = this.characters.filter((character) => character.playerId === playerId)
    if (characters.length <= 1) {
      return true
    }

    return !characters.some((character) => {
      const { x, y } = this.getTile(character.position.x, character.position.y)
      for (let diffY = -1; diffY <= 1; diffY++) {
        for (let diffX = -1; diffX <= 1; diffX++) {
          if (diffX === 0 && diffY === 0) {
            continue
          }
          const tile = this.getTile(x + diffX, y + diffY)
          const canMove = this.isPassable(character.playerId, tile) && !this.killsPlayer(tile, character.playerId)
          if (canMove) {
            return true
          }
        }
      }
      return false
    })
  }

  private players() {
    return Object.keys(this.characters.reduce((acc, character) => {
      acc[character.playerId] = true
      return acc
    }, {} as Record<string, boolean>))
  }

  isOver() {
    const players = this.players()
    if (players.length <= 1) {
      return true
    }
    const livingPlayerCount = players.filter((playerId) => !this.isPlayerDead(playerId)).length
    return livingPlayerCount <= 1
  }

  randomBoardLocation() {
    const y = randomInt(this.tiles.length)
    const x = randomInt(this.tiles[0].length)
    return { x, y }
  }

  randomAvailableInitialLocation(playerId: string): Tile {
    const location = this.randomBoardLocation()
    const tile = this.getTile(location.x, location.y)
    if ([TileType.stone, TileType.water].includes(tile.type) || this.getOccupent(tile.x, tile.y) || this.killsPlayer(tile, playerId)) {
      return this.randomAvailableInitialLocation(playerId)
    }
    return tile
  }
}

export default BoardLogic
