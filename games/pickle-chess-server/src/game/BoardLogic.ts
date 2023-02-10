import { AStarFinder } from "astar-typescript"
import { IPoint } from "astar-typescript/dist/interfaces/astar.interfaces"
import { PickleChessState, Tile, TileType } from "../rooms/schema/PickleChessState"
import { RawBoard } from "./boardFetching"
import CharacterLogic from "./CharacterLogic"
import { randomInt } from "./utils/randoms"

const tileFloor = (num: number) => {
  return Math.max(0, Math.round(num))
}

class BoardLogic {
  // private state: PickleChessState
  private characters: CharacterLogic[]

  tiles: Tile[][]

  constructor(characters: CharacterLogic[], tiles?: Tile[]) {
    if (tiles) {
      this.populateInternalTiles(tiles)
    } else {
      this.tiles = []
    }
    this.characters = characters
    // this.state = state
  }

  private populateInternalTiles(tiles:Tile[]) {
    this.tiles = Array(tiles.length).fill([])
    tiles.forEach((tile) => this.tiles[tile.y].push(tile))
  }

  getOccupent(x: number, y: number) {
    const tile = this.getTile(x, y)
    return this.characterAt(tile)
  }

  characterAt(tile: Tile) {
    return this.characters.find((character) => character.state.tileId === tile.id)
  }

  isPassable(playerId: string, tile?: Tile) {
    if (!tile) {
      return false
    }
    if ([TileType.water, TileType.stone].includes(tile.type)) {
      return false
    }
    const character = this.characterAt(tile)
    if (character && character.state.playerId === playerId) {
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

    return character.state.playerId !== playerId
  }

  getTile(x: number, y: number) {
    const column = this.tiles[tileFloor(y)] || []
    return column[tileFloor(x)]
  }

  findPath(from: IPoint, to: IPoint, movingCharacter: CharacterLogic) {
    const aStar = new AStarFinder({
      grid: {
        matrix: this.tiles.map((column) => column.map((tile) => {
          if ([TileType.water, TileType.stone].includes(tile.type)) {
            return 1
          }
          const character = this.characterAt(tile)
          if (character && character.state.id !== movingCharacter.state.id) {
            return 1
          }
          if (this.killsPlayer(tile, movingCharacter.state.playerId)) {
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
    const allTiles:Tile[] = []
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
        this.tiles[y][x] = tile
        allTiles.push(tile)
      }
    }
    return allTiles
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

  isOver() {
    const playerCharacters = this.characters.reduce((acc, character) => {
      acc[character.state.playerId] = acc[character.state.playerId] || []
      acc[character.state.playerId].push(character)
      return acc
    }, {} as Record<string, CharacterLogic[]>)

    const playerWithOneCharacter = Object.values(playerCharacters).some((characters) => characters.length <= 1)
    if (playerWithOneCharacter) {
      console.log("over because characters removed")
      return true
    }

    const playerThatCannotMove = Object.values(playerCharacters).findIndex((characters) => {
      return !characters.some((character) => {
        const { x, y } = this.getTile(character.position().x, character.position().z)
        for (let diffY = -1; diffY <= 1; diffY++) {
          for (let diffX = -1; diffX <= 1; diffX++) {
            if (diffX === 0 && diffY === 0) {
              continue
            }
            const tile = this.getTile(x + diffX, y + diffY)
            const canMove = this.isPassable(character.state.playerId, tile) && !this.killsPlayer(tile, character.state.playerId)
            if (canMove) {
              return true
            }
          }
        }
        return false
      })
    })

    if ( playerThatCannotMove >= 0 ) {
      const characters = Object.values(playerCharacters)[playerThatCannotMove]
      console.log("over because player cannot move", Object.keys(playerCharacters)[playerThatCannotMove])
      const isSome = characters.some((character) => {
        const { x, y } = this.getTile(character.position().x, character.position().z)
        for (let diffY = -1; diffY <= 1; diffY++) {
          for (let diffX = -1; diffX <= 1; diffX++) {
            if (diffX === 0 && diffY === 0) {
              continue
            }
            const tile = this.getTile(x + diffX, y + diffY)
            return this.isPassable(character.state.playerId, tile) && !this.killsPlayer(tile, character.state.playerId)
          }
        }
        return false
      })
      console.log("isSome: ", isSome)
      characters.forEach((character) => {
        //log out if the character cannot move and which squares are passable
        const { x, y } = this.getTile(character.position().x, character.position().z)
        console.log("character on: ", x, y)
        for (let diffY = -1; diffY <= 1; diffY++) {
          for (let diffX = -1; diffX <= 1; diffX++) {
            if (diffX === 0 && diffY === 0) {
              continue
            }
            const tile = this.getTile(x + diffX, y + diffY)
            console.log("tile", tile, this.isPassable(character.state.playerId, tile), !this.killsPlayer(tile, character.state.playerId))
          }
        }
      })
    }

    return playerThatCannotMove >= 0
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
