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

  getOccupents(x: number, y: number) {
    const tile = this.getTile(x, y)
    return this.charactersAt(tile)
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
    if (tile.type > 3) {
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
          const character = this.characterAt(tile)
          if (character) {
            // if there's a character on this tile and it is the character we're moving then of course it's allowed to move.
            if (character.id === movingCharacter.id) {
              return 0
            }
            // but if there's already another character on the tile, then we cannot move there.
            return 1
          }

          if (!this.isPassableTerrain(tile)) {
            return 1
          }

          // if a character moving to this tile would kill them, then do not let them move there.
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
    const path = aStar.findPath(from, to)
    if (path.length === 0) {
      console.log("no path", from.x, from.y, to.x, to.y, aStar.getGrid().getGridNodes().map((col, y) => col.map((n, x) => [x,y, n.getIsWalkable()])))
    }
    return path
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
          // console.log(tile.x, tile.y, "is occupied by opponent of ", playerId)
          tileCount++
        }
      }
    }
    return tileCount
  }

  private moveableKillSquareCount(playerTile: Tile, excluding?: CharacterType) {
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
        const charAtTile = this.characterAt(tile)
        if (this.isPassableTerrain(tile) && (!charAtTile || charAtTile.id === excluding?.id)) {
          tileCount++
        }
      }
    }
    return tileCount
  }

  private playerOccupiedKillSquares(playerTile: Tile, playerId: string) {
    const tiles: Tile[] = []
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
        if (this.isOccupiedByPlayer(playerId, tile)) {
          tiles.push(tile)
        }
      }
    }
    return tiles
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
  private terminalDirectionalPoint(playerTile: Tile, playerId: string, direction: "up" | "down" | "left" | "right"): Tile | undefined {
    const offset = this.offsetForDirection(direction)
    return this.getTile(playerTile.x + offset.x, playerTile.y + offset.y)
  }


  killsCharacter(playerTile: Tile, playerId: string, excluding?: CharacterType, debug?: boolean, depth = 0) {
    if (depth > 4) {
      return false
    }

    const tileAbove = this.terminalDirectionalPoint(playerTile, playerId, "up")
    const tileBelow = this.terminalDirectionalPoint(playerTile, playerId, "down")
    const tileLeft =  this.terminalDirectionalPoint(playerTile, playerId, "left")
    const tileRight = this.terminalDirectionalPoint(playerTile, playerId, "right")

    if ([tileAbove, tileBelow, tileLeft, tileRight].every((t) => !t || !this.isPassableTerrain(t))) {
      return true
    }

    if (this.isOccupiedByOpposingPlayer(playerId, tileAbove) && this.isOccupiedByOpposingPlayer(playerId, tileBelow)) {
      if (debug) console.log("normal above and below kill", playerTile.x, playerTile.y)
      return true
    }

    if (this.isOccupiedByOpposingPlayer(playerId, tileLeft) && this.isOccupiedByOpposingPlayer(playerId, tileRight)) {
      if (debug) console.log("normal left, right kill", playerTile.x, playerTile.y)
      return true
    }

    const moveableCount = this.moveableKillSquareCount(playerTile, excluding)
    const opponentSides = this.killSquaresWithOpponent(playerTile, playerId)

    if (opponentSides === 0) {
      if (moveableCount > 0) {
        return false
      }

      // check for any surrounding tiles that are occupied by the player and if that character is going to die, then this character is dead
      const playerSurroundingTiles = this.playerOccupiedKillSquares(playerTile, playerId)
      for (let tile of playerSurroundingTiles) {
        if (this.killsCharacter(tile, playerId, excluding, debug, depth + 1)) {
          if (debug) console.log("surrounding player tile kill", playerTile.x, playerTile.y)
          return true
        }
      }

      return false
    }

    switch (moveableCount) {
      case 0:
        return true // player cannot move but at least one side is an opponent
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
          const canMove = this.isPassableTerrainAndNotOwnCharacter(character.playerId, tile) && !this.killsCharacter(tile, character.playerId)
          if (canMove) {
            return true
          }
        }
      }
      return false
    })
  }

  private findNextShrinkage() {
    let i = 0;
    let tile = this.getTile(i, i)
    while (tile && tile.type === TileType.disabled) {
      i++
      tile = this.getTile(i, i)
    }
    return i
  }

  shrinkBoard() {
   const nextShrinkage = this.findNextShrinkage()

   const outerColumn = this.tiles.length - 1
   const outerRow = this.tiles[0].length - 1

   this.tiles.forEach((row, x) => {
      row.forEach((tile, y) => {
        if (x === nextShrinkage || y == nextShrinkage || x === outerColumn - nextShrinkage || y === outerRow - nextShrinkage) {
          tile.type = TileType.disabled
        }
      })
   })
  }

  deadCharacters() {
    const deadPlayerIds = this.deadPlayers()

    const toDelete:CharacterType[] = []
    this.characters.forEach((character) => {
      const playerId = character.playerId
      const { x, y } = character.position
      const playerTile = this.getTile(x, y)
      if (!playerTile) {
        console.error("tile not found", x, y)
        return
      }
      if (this.killsCharacter(playerTile, playerId, undefined, true) || deadPlayerIds.includes(playerId)) {
        toDelete.push(character)
      }
    })
    
    return toDelete
  }

  private players() {
    return Object.keys(this.characters.reduce((acc, character) => {
      acc[character.playerId] = true
      return acc
    }, {} as Record<string, boolean>))
  }

  livingPlayers() {
    return this.players().filter((playerId) => !this.isPlayerDead(playerId))
  }

  private deadPlayers() {
    return this.players().filter((playerId) => this.isPlayerDead(playerId))
  }

  isOver() {
    const players = this.players()
    if (players.length <= 1) {
      return true
    }
    return this.livingPlayers().length <= 1
  }

  winner() {
    // note this only works because isOver expects only one single winner
    return this.livingPlayers()[0]
  }

  randomBoardLocation() {
    const y = randomInt(this.tiles.length)
    const x = randomInt(this.tiles[0].length)
    return { x, y }
  }

  randomAvailableInitialLocation(playerId: string): Tile {
    const location = this.randomBoardLocation()
    const tile = this.getTile(location.x, location.y)
    if (!this.isPassableTerrain(tile) || this.getOccupent(tile.x, tile.y) || this.killsCharacter(tile, playerId)) {
      return this.randomAvailableInitialLocation(playerId)
    }
    return tile
  }
}

export default BoardLogic
