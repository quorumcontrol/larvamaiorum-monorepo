import { randomInt } from "../game/utils/randoms"

interface MonteCarloFunctions<GameState, Action, Player> {
    generateActions: (state: GameState) => Action[]
    applyAction: (state: GameState, action: Action) => GameState
    stateIsTerminal: (state: GameState) => boolean
    calculateReward: (state: GameState, player: Player) => number
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

  async getAction(state: GameState, playerId: Player): Promise<Action>{
    const start = Date.now()
    const actions = this.funcs.generateActions(state)
    const scores = new Array(actions.length).fill(0)
    const maxTime = this.config.duration

    // first make a bucket for each action, then walk the tree for each action and add up the scores from each run
    // and then loop for the configured duration.
    while (Date.now() - start < maxTime) {
      await Promise.all(actions.map(async (action, i) => {
        scores[i] += await this.scoreAction(state, action, playerId, 0)
        return
      }))
    }
    // console.log("actions", actions, "scores: ", scores)
    // now pick the action with the highest score
    const maxScore = Math.max(...scores)
    const maxScoreIndex = scores.findIndex((score) => score === maxScore)
    return actions[maxScoreIndex]
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
