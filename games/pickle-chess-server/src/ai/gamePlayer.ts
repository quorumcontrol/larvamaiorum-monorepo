import { IPoint } from "astar-typescript/dist/interfaces/astar.interfaces";
import { Macao } from "macao";
import BoardLogic from "../game/BoardLogic";
import CharacterLogic from "../game/CharacterLogic";
import { TileType } from "../rooms/schema/PickleChessState";

interface AICharacter {
  playerId: string
  location: IPoint
}

interface AITile {
  location: IPoint
  type: TileType
}

interface AIGameState {
  board: AITile[][]
  characters: AICharacter[]
  players: string[] // player ids
  player: number // index of players so we can use modulo to get the next player
}

export interface AIGameAction {
  playerId: string // index of state.players
  from: IPoint
  to: IPoint
}

const opposingPlayerAt = function (playerId: string, state: AIGameState, location: IPoint): boolean {
  return state.characters.some((c) => c.location.x === location.x && c.location.y === location.y && c.playerId !== playerId)
}

const areTwoSidesBlocked = function (playerId: string, state: AIGameState, location: IPoint): boolean {
  let count = 0
  for (let yDiff = -1; yDiff <= 1; yDiff++) {
    for (let xDiff = -1; xDiff <= 1; xDiff++) {
      if (xDiff == yDiff) {
        continue // ignore diagonals
      }
      if (!isMoveableWithoutCheckingForKills(playerId, state, { x: location.x + xDiff, y: location.y + yDiff })) {
        count++
      }
    }
  }
  return count >= 2
}

const areTwoSidesFilledWithOpponents = function (playerId: string, state: AIGameState, location: IPoint): boolean {
  let count = 0
  for (let yDiff = -1; yDiff <= 1; yDiff++) {
    for (let xDiff = -1; xDiff <= 1; xDiff++) {
      if (xDiff == yDiff) {
        continue // ignore diagonals
      }
      if (opposingPlayerAt(playerId, state, { x: location.x + xDiff, y: location.y + yDiff })) {
        count++
      }
    }
  }
  return count >= 2
}

const killsPlayer = function (playerId: string, state: AIGameState, to: IPoint): boolean {
  const tile = state.board[to.y][to.x]
  if (!tile) {
    throw new Error("no tile for kills player")
  }
  if (opposingPlayerAt(playerId, state, { x: tile.location.x + 1, y: tile.location.y }) && opposingPlayerAt(playerId, state, { x: tile.location.x - 1, y: tile.location.y })) {
    // console.log("opposing player on left and right")
    return true
  }
  if (opposingPlayerAt(playerId, state, { x: tile.location.x, y: tile.location.y + 1 }) && opposingPlayerAt(playerId, state, { x: tile.location.x, y: tile.location.y - 1 })) {
    // console.log("opposing player on top and bottom")
    return true
  }

  // otherwise if two sides are blocked but the other two have a player on them then it's death too
  if (areTwoSidesBlocked(playerId, state, tile.location) && areTwoSidesFilledWithOpponents(playerId, state, tile.location)) {
    // console.log("two sides are blocked and two opponents are on the other sides", to, state.characters, playerId)
    return true
  }

  return false
}

// const characterAt = function(characters:AICharacter[], location: IPoint): AICharacter | undefined {
//   return characters.find((c) => c.location.x === location.x && c.location.y === location.y)
// }

const isMoveableWithoutCheckingForKills = function (playerId: string, state: AIGameState, to: IPoint): boolean {
  const tile = (state.board[to.y] || [])[to.x]
  if (!tile) {
    // console.log("no tile: ", to, "for", playerId)
    return false
  }
  if ([TileType.water, TileType.stone].includes(tile.type)) {
    return false
  }
  const character = state.characters.find((c) => c.location.x === to.x && c.location.y === to.y)
  // if (character) {
  //   console.log("character at: ", to, "for", playerId, "character", character)
  // }
  return !character
}

const isMoveable = function (playerId: string, state: AIGameState, to: IPoint): boolean {
  try {
    return isMoveableWithoutCheckingForKills(playerId, state, to) && !killsPlayer(playerId, state, to)
  } catch (err) {
    console.error("error with is moveable: ", err)
    console.error(to, playerId)
    throw err
  }

}

const generateActions = (state: AIGameState): AIGameAction[] => {
  const actions: AIGameAction[] = []
  const player = state.players[state.player]
  const characters = state.characters.filter((character) => character.playerId === player)
  if (characters.length === 0) {
    console.error("no players found for player: ", player, "players: ", state.players, "player: ", state.player, "characters: ", state.characters)
    throw new Error('missing characters')
  }
  for (let yDiff = -1; yDiff <= 1; yDiff++) {
    for (let xDiff = -1; xDiff <= 1; xDiff++) {
      if (xDiff === 0 && yDiff === 0) {
        continue // ignore the current location
      }
      characters.forEach((character) => {
        const to = { x: character.location.x + xDiff, y: character.location.y + yDiff }
        if (isMoveable(player, state, to)) {
          actions.push({ playerId: player, from: character.location, to })
        }
        // } else {
        //   // console.log("not moveable: ", to, "for", character.location, "player", player)
        // }
      })
    }
  }
  // console.log("actions: ", actions)
  return actions
}

const applyAction = (state: AIGameState, action: AIGameAction): AIGameState => {
  if (!action || !action.from || !action.to) {
    console.error("missing action")
    throw new Error("missing action")
  }
  const newCharacters = state.characters.map((character) => {
    return {
      ...character,
      location: character.location.x === action.from.x && character.location.y === action.from.y ? { ...action.to } : character.location
    }
  }).filter((c) => {
    return !killsPlayer(action.playerId, state, c.location)
  })
  const newState = { ...state, characters: newCharacters, player: (state.player + 1) % state.players.length }

  // console.log("apply action: ", action, "state", state.characters, "new characters", newCharacters, "newPlayer", newState.player)
  return newState
}

const stateIsTerminal = (state: AIGameState): boolean => {
  const isTerminal = state.players.some((playerId) => {
    return state.characters.filter((character) => character.playerId === playerId).length <= 1
  })
  return isTerminal
}

const calculateReward = (state: AIGameState, player: number): number => {
  const characterCounts = state.players.map((playerId) => {
    return state.characters.filter((character) => character.playerId === playerId).length
  })

  const maxCharacterCount = Math.max(...characterCounts)
  const maxCharacterCountPlayer = characterCounts.findIndex((count) => count === maxCharacterCount) || 0  // default to 0 if no player found
  // find highest character count for a player and return a huge reward for that player
  return maxCharacterCountPlayer === player ? 1 : -1
}

export const getMacao = () => {
  return new Macao({
    generateActions,
    applyAction,
    stateIsTerminal,
    calculateReward,
  }, {
    duration: 30,
  })
}

export class AIBrain {
  private board: BoardLogic
  private characters: CharacterLogic[]
  private players: string[]
  private macao: ReturnType<typeof getMacao>

  constructor(board: BoardLogic, characters: CharacterLogic[], playerIds: string[]) {
    this.board = board
    this.characters = characters
    this.players = playerIds
    this.macao = getMacao()
  }

  getAction(playerId: string): Promise<AIGameAction> {
    return this.macao.getAction(this.getGameState(playerId))
  }

  private getGameState(playerId: string): AIGameState {
    const aiBoard = this.board.tiles.map((column) => {
      return column.map((tile) => {
        return {
          type: tile.type,
          location: { x: tile.x, y: tile.y },
        }
      })
    })

    const aiCharacters = this.characters.map((character) => {
      const position = character.position()
      if (!position) {
        throw new Error("character has no position")
      }
      const { x, y } = this.board.getTile(position.x, position.z)
      return {
        playerId: character.state.playerId,
        location: { x, y },
      }
    })

    return {
      board: aiBoard,
      characters: aiCharacters,
      players: this.players,
      player: this.players.indexOf(playerId),
    }
  }

}
