import { AStarFinder } from "astar-typescript"
import { IPoint } from "astar-typescript/dist/interfaces/astar.interfaces"
import { TileType } from "../rooms/schema/PickleChessState"
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

  characterAt(tile: Tile): CharacterType | undefined {
    return this.characters.find((character) => character.tileId === tile.id)
  }

  charactersAt(tile: Tile): CharacterType[] {
    return this.characters.filter((character) => character.tileId === tile.id)
  }

  isPassableTerrain(tile?: Tile) {
    if (!tile) {
      return false
    }
    if ([TileType.water, TileType.stone].includes(tile.type)) {
      return false
    }
    return true
  }

  isPassableTerrainAndNotOwnCharacter(playerId: string, tile?: Tile, excluding?: CharacterType) {
    if (!this.isPassableTerrain(tile)) {
      return false
    }
    const character = this.characterAt(tile)
    if (character && character.playerId === playerId && character.id !== excluding?.id) {
      // console.log("character there and owned by player", tile.x, tile.y)
      return false
    }
    // console.log("passable")
    return true
  }

  isOccupiedByOpposingPlayer(playerId: string, tile?: Tile) {
    if (!tile) {
      return false
    }
    const characters = this.charactersAt(tile)
    if (characters.length === 0) {
      return false
    }

    return characters.some((c) => c.playerId !== playerId)
  }

  isOccupiedByPlayer(playerId: string, tile?: Tile) {
    if (!tile) {
      return false
    }
    const characters = this.charactersAt(tile)
    if (characters.length === 0) {
      return false
    }

    return characters.some((c) => c.playerId === playerId)
  }

  getTile(x: number, y: number) {
    const column = this.tiles[Math.round(y)] || []
    return column[Math.round(x)]
  }

  findPath(from: IPoint, to: IPoint, movingCharacter: CharacterType) {
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
          if (this.killsCharacter(tile, movingCharacter.playerId, movingCharacter)) {
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

  private impassableKillSquareCount(playerTile: Tile, playerId: string, excluding?: CharacterType) {
    let tileCount = 0
    for (let diffY = -1; diffY <= 1; diffY++) {
      for (let diffX = -1; diffX <= 1; diffX++) {
        // ignore diagonals and the center
        if (Math.abs(diffX) === Math.abs(diffY)) {
          continue
        }
        const tile = this.getTile(playerTile.x + diffX, playerTile.y + diffY)
        if (!this.isPassableTerrainAndNotOwnCharacter(playerId, tile, excluding)) {
          tileCount++
        }
      }
    }
    return tileCount
  }

  private killSquaresWithOpponent(playerTile: Tile, playerId: string) {
    let tileCount = 0
    for (let diffY = -1; diffY <= 1; diffY++) {
      for (let diffX = -1; diffX <= 1; diffX++) {
        // ignore diagonals and the center
        if (Math.abs(diffX) === Math.abs(diffY)) {
          continue
        }
        const tile = this.getTile(playerTile.x + diffX, playerTile.y + diffY)
        if (!tile) {
          continue
        }
        if (this.isOccupiedByOpposingPlayer(playerId, tile)) {
          tileCount++
        }
      }
    }
    return tileCount
  }

  private offsetForDirection(direction: "up" | "down" | "left" | "right") {
    switch (direction) {
      case "up":
        return { x: 0, y: 1 }
      case "down":
        return { x: 0, y: -1 }
      case "left":
        return { x: -1, y: 0 }
      case "right":
        return { x: 1, y: 0 }
    }
  }

  // is up a kill square
  private terminalDirectionalSquare(playerTile: Tile, playerId: string, direction: "up" | "down" | "left" | "right") {
    const offset = this.offsetForDirection(direction)
    let currentTile = playerTile
    while (true) {
      const tile = this.getTile(currentTile.x + offset.x, currentTile.y + offset.y)
      if (this.isOccupiedByPlayer(playerId, tile)) {
        // console.log("occupied by player", playerId, direction, tile.x, tile.y, "original: ", playerTile.x, playerTile.y)
        currentTile = tile
        continue
      }

      return tile
    }
  }

  private verticalCountOfSamePlayerIds(top: Tile, bottom: Tile, playerId: string) {
    // console.log("top: ", top.x, top.y, "bottom: ", bottom.x, bottom.y, "playerId: ", playerId)
    let count = 0
    for (let y = bottom.y - 1; y <= top.y + 1; y++) {
      const tile = this.getTile(bottom.x, y)
      // console.log("checking tile", tile.x, tile.y, this.isOccupiedByPlayer(playerId, tile))
      if (this.isOccupiedByPlayer(playerId, tile)) {
        count++
      }
    }
    return count
  }

  private horizontalCountOfSamePlayerIds(left: Tile, right: Tile, playerId: string) {
    let count = 0
    for (let x = left.x - 1; x <= right.x + 1; x++) {
      const tile = this.getTile(x, left.y)
      if (this.isOccupiedByPlayer(playerId, tile)) {
        count++
      }
    }
    return count
  }

  killsCharacter(playerTile: Tile, playerId: string, excluding?: CharacterType) {

    // first find if the tile above and below is occupied by an opponent
    const tileAbove = this.terminalDirectionalSquare(playerTile, playerId, "up")
    const tileBelow = this.terminalDirectionalSquare(playerTile, playerId, "down")
    const tileLeft = this.terminalDirectionalSquare(playerTile, playerId, "left")
    const tileRight = this.terminalDirectionalSquare(playerTile, playerId, "right")

    // const isWorthConsidering = (tile: Tile) => {
    //   return this.isOccupiedByOpposingPlayer(playerId, tile) || !this.isPassableTerrain(tile)
    // }

    if (this.isOccupiedByOpposingPlayer(playerId, tileAbove) && this.isOccupiedByOpposingPlayer(playerId, tileBelow)) {
      return true
    }

    if (this.isOccupiedByOpposingPlayer(playerId, tileLeft) && this.isOccupiedByOpposingPlayer(playerId, tileRight)) {
      return true
    }

    const vertCount = this.verticalCountOfSamePlayerIds(tileAbove || playerTile, tileBelow || playerTile, playerId)
    // console.log("vert count: ", vertCount)
    const horzCount = this.horizontalCountOfSamePlayerIds(tileLeft || playerTile, tileRight || playerTile, playerId)
    if (vertCount > 1) {
      return (this.isOccupiedByOpposingPlayer(playerId, tileAbove) || !this.isPassableTerrain(tileAbove)) &&
        (this.isOccupiedByOpposingPlayer(playerId, tileBelow) || !this.isPassableTerrain(tileBelow)) &&
          (this.isOccupiedByOpposingPlayer(playerId, tileAbove) || this.isOccupiedByOpposingPlayer(playerId, tileBelow))
    }

    if (horzCount > 1) {
      return (this.isOccupiedByOpposingPlayer(playerId, tileLeft) || !this.isPassableTerrain(tileLeft)) &&
        (this.isOccupiedByOpposingPlayer(playerId, tileRight) || !this.isPassableTerrain(tileRight)) &&
          (this.isOccupiedByOpposingPlayer(playerId, tileLeft) || this.isOccupiedByOpposingPlayer(playerId, tileRight))
    }

    // // if the tile above is impassable or has an opponent on it and the tile below is impassable or has an opponent on it then it's a kill if at least one of those has an opponent on it.
    // if (isWorthConsidering(tileAbove) &&
    //     isWorthConsidering(tileBelow) && 
    //     (this.isOccupiedByOpposingPlayer(playerId, tileAbove) || this.isOccupiedByOpposingPlayer(playerId, tileBelow))) {

    //   return true
    // }

    // if (isWorthConsidering(tileLeft) &&
    //     isWorthConsidering(tileRight) && 
    //     (this.isOccupiedByOpposingPlayer(playerId, tileLeft) || this.isOccupiedByOpposingPlayer(playerId, tileRight))) {

    //   return true
    // }

    // if (tileAbove && tileBelow && this.isOccupiedByOpposingPlayer(playerId, tileAbove) && this.isOccupiedByOpposingPlayer(playerId, tileBelow)) {
    //   return true
    // }

    // if (tileLeft && tileRight && this.isOccupiedByOpposingPlayer(playerId, tileLeft) && this.isOccupiedByOpposingPlayer(playerId, tileRight)) {
    //   return true
    // }

    const opponentSides = this.killSquaresWithOpponent(playerTile, playerId)
    if (opponentSides === 0) {
      return false
    }

    const impassabeSides = this.impassableKillSquareCount(playerTile, playerId, excluding)
    // console.log("impassable: ", impassabeSides)
    switch (impassabeSides) {
      case 2:
        return opponentSides === 2
      case 3:
        return opponentSides === 1
    }

    // // check for the corners of the board which would allow a top,left or a top, right, etc to remove a character.
    // if (!this.isPassable(playerId, tileAbove) && !this.isPassable(playerId, tileLeft) && this.isOccupiedByOpposingPlayer(playerId, tileRight) && this.isOccupiedByOpposingPlayer(playerId, tileBelow)) {
    //   return true
    // }

    // if (!this.isPassable(playerId, tileAbove) && !this.isPassable(playerId, tileRight) && this.isOccupiedByOpposingPlayer(playerId, tileLeft) && this.isOccupiedByOpposingPlayer(playerId, tileBelow)) {
    //   return true
    // }

    // if (!this.isPassable(playerId, tileBelow) && !this.isPassable(playerId, tileLeft) && this.isOccupiedByOpposingPlayer(playerId, tileRight) && this.isOccupiedByOpposingPlayer(playerId, tileAbove)) {
    //   return true
    // }

    // if (!this.isPassable(playerId, tileBelow) && !this.isPassable(playerId, tileRight) && this.isOccupiedByOpposingPlayer(playerId, tileLeft) && this.isOccupiedByOpposingPlayer(playerId, tileAbove)) {
    //   return true
    // }

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
          const canMove = this.isPassableTerrainAndNotOwnCharacter(character.playerId, tile) && !this.killsCharacter(tile, character.playerId)
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
    if ([TileType.stone, TileType.water].includes(tile.type) || this.getOccupent(tile.x, tile.y) || this.killsCharacter(tile, playerId)) {
      return this.randomAvailableInitialLocation(playerId)
    }
    return tile
  }
}

export default BoardLogic
