import { randomInt } from "../game/utils/randoms"

interface MonteCarloFunctions<GameState, Action, Player> {
    generateActions: (state: GameState) => Action[]
    applyAction: (state: GameState, action: Action) => GameState
    stateIsTerminal: (state: GameState) => boolean
    calculateReward: (state: GameState, player: Player) => number
    filter: (actions: Action[]) => Action[]
    shortCircuits: (state:GameState, actions: Action[], playerId: Player) => Action[]
}

interface MonteCarloConfig {
  duration: number,
  maxDepth: number,
}

class MonteCarlo<GameState, Action, Player> {
  funcs: MonteCarloFunctions<GameState, Action, Player>
  config: MonteCarloConfig

  constructor(funcs: MonteCarloFunctions<GameState, Action, Player>, config: Partial<MonteCarloConfig> = { }) {
    this.funcs = funcs
    config.duration ||= 30
    config.maxDepth ||= 1000
    this.config = config as MonteCarloConfig
  }

  async getScoredActions(state: GameState, playerId: Player): Promise<Action[]> {
    const start = Date.now()
    //filter out actions that do not move a character
    const actions = this.funcs.filter(this.funcs.generateActions(state))
    
    const shortCircuted = this.funcs.shortCircuits(state, actions, playerId)
    if (shortCircuted.length > 0) {
      console.log("short circuited: ", shortCircuted.length, " actions", shortCircuted)
      return shortCircuted
    }

    const scores = new Array(actions.length).fill(0)
    const maxTime = this.config.duration

    while (Date.now() - start < maxTime) {
      await Promise.all(actions.map(async (action, i) => {
        scores[i] += await this.scoreAction(state, action, playerId, 0)
        return
      }))
    }
    // return actions sorted by scores where highest score is first
    return actions.map((action, i) => ({ action, score: scores[i] })).sort((a, b) => b.score - a.score).map((a) => a.action)
  }

  async getAction(state: GameState, playerId: Player): Promise<Action>{
    return (await this.getScoredActions(state, playerId))[0]
  }

  private async scoreAction(state: GameState, action: Action, player: Player, depth: number): Promise<number> {
    const newState = this.funcs.applyAction(state, action)
    if (this.funcs.stateIsTerminal(newState) || depth > this.config.maxDepth) {
      return this.funcs.calculateReward(newState, player)
    }
    const newActions = this.funcs.generateActions(newState)
    // now pick a *random* action to walk on this tree
    const randomAction = newActions[randomInt(newActions.length)]
    // the further away the reward is, the less valuable it is
    return (await this.scoreAction(newState, randomAction, player, depth + 1)) / (depth + 1)
  }
}

export default MonteCarlo
