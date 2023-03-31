import { randomInt } from "../game/utils/randoms"

interface MonteCarloFunctions<GameState, Action, Player> {
    generateActions: (state: GameState) => Action[]
    applyAction: (state: GameState, action: Action) => GameState
    stateIsTerminal: (state: GameState) => boolean
    calculateReward: (state: GameState, player: Player) => number
    filter: (actions: Action[]) => Action[]
    shortCircuits: (state:GameState, actions: Action[], playerId: Player) => Action[]
}

export interface MonteCarloConfig {
  duration: number,
  maxDepth: number,
  reverse?: boolean
}

export function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
};

class MonteCarlo<GameState, Action, Player> {
  funcs: MonteCarloFunctions<GameState, Action, Player>
  config: MonteCarloConfig

  constructor(funcs: MonteCarloFunctions<GameState, Action, Player>, config: Partial<MonteCarloConfig> = { }) {
    this.funcs = funcs
    config.duration ||= 30
    config.maxDepth ||= 20
    this.config = config as MonteCarloConfig
  }

  async getScoredActions(state: GameState, playerId: Player): Promise<Action[]> {
    const start = Date.now()
    //filter out actions that do not move a character
    const actions = this.funcs.filter(this.funcs.generateActions(state))
    
    const shortCircuted = this.funcs.shortCircuits(state, actions, playerId)
    if (shortCircuted.length > 0) {
      // console.log("short circuited: ", shortCircuted.length, " actions", shortCircuted)
      return shortCircuted
    }

    const scores = new Array(actions.length).fill(0)
    const maxTime = this.config.duration

    while (Date.now() - start < maxTime) {
      await Promise.all(shuffle(actions).map(async (action, i) => {
        scores[i] += await this.scoreAction(state, action, playerId, 0)
        return
      }))
    }
    // return actions sorted by scores where highest score is first
    const scored = actions.map((action, i) => ({ action, score: scores[i] })).sort((a, b) => b.score - a.score)
    const acts = scored.map((a) => a.action)
    if (this.config.reverse) {
      acts.reverse()
    }
    // console.log("scored", scored, "actions: ", acts)
    return acts
  }

  async getAction(state: GameState, playerId: Player): Promise<Action>{
    return (await this.getScoredActions(state, playerId))[0]
  }

  private async scoreAction(state: GameState, action: Action, player: Player, depth: number): Promise<number> {
    const newState = this.funcs.applyAction(state, action)
    if (this.funcs.stateIsTerminal(newState) || depth >= this.config.maxDepth) {
      return this.funcs.calculateReward(newState, player)
    }
    const newActions = this.funcs.generateActions(newState)

    // now pick a *random* action to walk on this tree
    const randomAction = newActions[randomInt(newActions.length)]
    // the further away the reward is, the less valuable it is
    return this.scoreAction(newState, randomAction, player, depth + 1)
  }
}

export default MonteCarlo
