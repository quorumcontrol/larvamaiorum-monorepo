import { IPoint } from "astar-typescript/dist/interfaces/astar.interfaces";
import BoardLogic from "../game/BoardLogic";
import CharacterLogic from "../game/CharacterLogic";
import MonteCarlo from "./montecarlo";

export interface AICharacter {
  id: string
  tileId: string
  playerId: string
  position: IPoint
}

export interface AIGameState {
  board: BoardLogic<AICharacter>
  characters: AICharacter[]
  players: string[] // player ids
  player: number // index of players so we can use modulo to get the next player
}

export interface AIGameAction {
  playerId: string // index of state.players
  from: IPoint
  to: IPoint
}

const locationsEqual = (a: IPoint, b: IPoint): boolean => {
  return a.x === b.x && a.y === b.y
}

export const generateActions = (state: AIGameState): AIGameAction[] => {
  const actions: AIGameAction[] = []
  const player = state.players[state.player]
  const characters = state.characters.filter((character) => character.playerId === player)
  if (characters.length === 0) {
    console.error("no players found for player: ", player, "players: ", state.players, "player: ", state.player, "characters: ", state.characters)
    throw new Error('missing characters')
  }
  for (let yDiff = 1; yDiff >= -1; yDiff--) {
    for (let xDiff = 1; xDiff >= -1; xDiff--) {
      characters.forEach((character) => {
        const to = { x: character.position.x + xDiff, y: character.position.y + yDiff }
        const tile = state.board.getTile(to.x, to.y)
        // console.log("check", to, "player", player, "for character", character.id, "tile", state.board.getTile(to.x, to.y), "isPassable", state.board.isPassable(player, state.board.getTile(to.x, to.y)))
        if (locationsEqual(character.position, to) || (state.board.isPassableTerrain(tile) && !state.board.getOccupent(to.x, to.y)) && !state.board.killsCharacter(tile, character.playerId, character)) {
          actions.push({ playerId: player, from: { ...character.position }, to })
        }
      })
    }
  }
  if (actions.length === 0) {
    console.error("no actions generated for player: ", player, "players: ", state.players, "player: ", state.player, "characters: ", state.characters)
    throw new Error('missing actions')
  }
  return actions
}

export const shortCircuits = (state: AIGameState, actions: AIGameAction[], playerId: string): AIGameAction[] => {
  return actions.filter((action) => {
    // return false
    const originalCountOfOpposingPlayers = state.characters.filter((c) => c.playerId !== playerId).length
    const newCountOfOpposingPlayers = applyAction(state, action).characters.filter((c) => c.playerId !== playerId).length
    return newCountOfOpposingPlayers < originalCountOfOpposingPlayers
  })
}

export const applyAction = (state: AIGameState, action: AIGameAction): AIGameState => {
  if (!action || !action.from || !action.to) {
    console.error("missing action")
    throw new Error("missing action")
  }

  let newCharacters = state.characters.map((character) => {
    const newCharacter = {
      ...character,
      position: character.position.x === action.from.x && character.position.y === action.from.y ? { ...action.to } : character.position
    }
    newCharacter.tileId = state.board.getTile(newCharacter.position.x, newCharacter.position.y).id
    return newCharacter
  })

  const newState = {
    board: new BoardLogic(newCharacters, state.board.tiles.flat()),
    characters: newCharacters,
    players: state.players,
    player: (state.player + 1) % state.players.length
  }


  const deadPlayerIds = Array.from(Object.values(newState.players)).filter((player) => newState.board.isPlayerDead(player)).map((player) => player)
  // loop through all the characters, if any character is surrounded on two sides by an opponent's character, then remove it. If they are in a corner then they can be boxed in on one side.
  const toDelete:AICharacter[] = []
  newState.characters.forEach((character) => {
    const playerId = character.playerId
    const { x, y } = character.position
    const playerTile = newState.board.getTile(x, y)
    if (!playerTile) {
      console.error("tile not found", x, y)
      return
    }
    if (newState.board.killsCharacter(playerTile, playerId) || deadPlayerIds.includes(playerId)) {
      toDelete.push(character)
    }
  })

  newCharacters = newCharacters.filter((character) => !toDelete.includes(character))

  // console.log("apply action: ", action, "state", state.characters, "new characters", newCharacters, "newPlayer", newState.player)
  return { ...newState, characters: newCharacters, player: (state.player + 1) % state.players.length }
}

const stateIsTerminal = (state: AIGameState): boolean => {
  return state.board.isOver()
}

export const calculateReward = (state: AIGameState, playerId: string): number => {
  const characterCounts = state.players.map((playerId) => {
    return state.characters.filter((character) => character.playerId === playerId).length
  })

  const minCharacterCount = Math.min(...characterCounts)
  const maxCharacterCount = Math.max(...characterCounts)

  const maxCharacterCountPlayer = characterCounts.findIndex((count) => count === maxCharacterCount) || 0  // default to 0 if no player found

  const isWinning = maxCharacterCountPlayer === state.players.indexOf(playerId)

  const playerScore = isWinning ? (characterCounts[state.players.indexOf(playerId)] - minCharacterCount) * 10 : (characterCounts[state.players.indexOf(playerId)] - maxCharacterCount)

  // find highest character count for a player and return a huge reward for that player
  if (stateIsTerminal(state)) {
    const winBoost = isWinning ? 5 : -5
    return winBoost + playerScore
  }
  // otherwise return the difference between the player's character count and the max character count
  return playerScore
}

export const filter = (actions: AIGameAction[]): AIGameAction[] => {
  return actions.filter((action) => (action.from.x !== action.to.x || action.from.y !== action.to.y))
}

export class AIBrain {
  private board: BoardLogic<CharacterLogic>
  private characters: CharacterLogic[]
  private montecarlo: MonteCarlo<AIGameState, AIGameAction, string>

  id: string

  constructor(id: string, board: BoardLogic<CharacterLogic>, characters: CharacterLogic[]) {
    this.id = id
    this.board = board
    this.characters = characters
    this.montecarlo = new MonteCarlo<AIGameState, AIGameAction, string>({
      generateActions,
      applyAction,
      stateIsTerminal,
      calculateReward,
      filter,
      shortCircuits,
    }, {
      duration: 10,
      maxDepth: 4,
    })
  }

  getAction(playerId: string): Promise<AIGameAction | undefined> {
    return this.montecarlo.getAction(this.getGameState(playerId), playerId)
  }

  getActions(playerId: string): Promise<AIGameAction[]> {
    return this.montecarlo.getScoredActions(this.getGameState(playerId), playerId)
  }

  private players() {
    return Object.keys(this.characters.reduce((playerIds, character) => {
      playerIds[character.state.playerId] = true
      return playerIds
    }, {} as Record<string, boolean>))
  }

  private getGameState(playerId: string): AIGameState {

    const aiCharacters = this.characters.map((character) => {
      try {
        const position = character.position
        if (!position) {
          throw new Error("character has no position")
        }
        const { x, y, id } = this.board.getTile(position.x, position.y)
        return {
          id: character.state.id,
          playerId: character.state.playerId,
          position: { x, y },
          tileId: id,
        }
      } catch (err) {
        console.error("err: ", err)
        console.error("tiles: ", this.board.tiles)
        console.error("character: ", character.position, character.state.id, character.state.playerId)
        throw err
    }

    })

    const players = this.players()

    return {
      board: new BoardLogic<AICharacter>(aiCharacters, this.board.tiles.flat()),
      characters: aiCharacters,
      players: players,
      player: players.indexOf(playerId),
    }
  }

}
