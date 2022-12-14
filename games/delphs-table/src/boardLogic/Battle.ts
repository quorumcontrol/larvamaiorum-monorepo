import { deterministicRandom } from "./random"
import Warrior, { WarriorState } from "./Warrior"
import debug from 'debug'
import EventEmitter from "events"

const TICK_EVT = 'tick'

const log = debug('Battle')

interface BattleOptions {
  warriors: Warrior[]
  startingTick: number
  seed: string
}

interface Roll {
  attacker: Warrior
  defender: Warrior
  attackRoll: number
  defenseRoll: number
}

interface RollReport {
  attacker: WarriorState
  defender: WarriorState
  attackRoll: number
  defenseRoll: number
}

export interface BattleTickReport {
  id: string
  rolls: RollReport[]
  isOver: boolean
  winner?: WarriorState
  loser?: WarriorState
  tick: number
  startingTick: number
  warriors: WarriorState[]
}

const WOOTGUMP_TAKE_PERCENTAGE = 0.5

class Battle extends EventEmitter {
  warriors: Warrior[]
  tick: number
  startingTick: number
  seed: string
  previousWinner?:Warrior

  constructor(opts: BattleOptions) {
    super()
    this.warriors = opts.warriors
    this.seed = opts.seed
    this.tick = opts.startingTick
    this.startingTick = opts.startingTick
    // if the warriors have cards, then do the health stuff *now* before any ticks
    this.warriors.forEach((w) => {
      const item = w.currentItemDetails()
      if (item) {
        w.currentHealth += (item.hp || 0)
      }
    })
  }

  doBattleTick(tick: number, seed: string):BattleTickReport {
    this.tick = tick
    this.seed = seed
    const rolls = this.doSubTicks()
    if (this.isOver()) {
      const winner = this.winner()
      const loser = this.loser()
      if (!winner || !loser) {
        console.error(this.battleId(), ' no winner or loser: ', this.warriors)
        throw new Error('the battle is over, but now inner')
      }
      const wootGumpToTake = Math.floor(loser.wootgumpBalance * WOOTGUMP_TAKE_PERCENTAGE)
      loser.wootgumpBalance -= wootGumpToTake
      winner.wootgumpBalance += wootGumpToTake
      this.warriors.forEach((w) => {
        w.clearItem()
      })
    }
    const report:BattleTickReport = {
      id: this.battleId(),
      rolls: rolls.map((r) => {
        return {
          ...r,
          attacker: r.attacker.toWarriorState(),
          defender: r.defender.toWarriorState(),
        }
      }),
      isOver: this.isOver(),
      winner: this.winner()?.toWarriorState(),
      loser: this.loser()?.toWarriorState(),
      tick: this.tick,
      startingTick: this.startingTick,
      warriors: this.warriors.map((w) => w.toWarriorState()),
    }
    this.emit(TICK_EVT, report)
    return report
  }

  winner() {
    if (!this.isOver()) {
      return undefined
    }
    return this.warriors[0].currentHealth >= this.warriors[1].currentHealth ? this.warriors[0] : this.warriors[1]
  }

  loser() {
    if (!this.isOver()) {
      return undefined
    }
    return this.warriors[0].currentHealth < this.warriors[1].currentHealth ? this.warriors[0] : this.warriors[1]
  }

  isOver() {
    // if one warrior is dead then it's over.
    return this.warriors.some((w) => {
      return !w.isAlive()
    })
  }

  private doSubTicks() {
    const rolls:Roll[] = []
    for (let i = 0; i < 3; i++) {
      if (this.isOver()) {
        continue
      }
      const { attacker, defender } = this.getPositions(i)
      const attackRoll = this.rand(attacker.currentAttack(), i.toString())
      const defenseRoll = this.rand(defender.currentDefense(), i.toString())
      if (attackRoll > defenseRoll) {
        defender.currentHealth -= (attackRoll - defenseRoll)
        this.log(`${attacker.name} hits ${defender.name} for ${attackRoll - defenseRoll} ${defender.currentHealth} left`)
      } else {
        this.log(`${defender.name} blocks ${attacker.name}`)
      }
      this.previousWinner = (attackRoll > defenseRoll) ? attacker : defender
      rolls.push({
        attacker,
        defender,
        attackRoll,
        defenseRoll
      })
    }
    return rolls
  }

  private getPositions(subTick:number) {
    if (this.previousWinner) {
      const attackerIndex = this.rand(3, subTick.toString())
      let attacker:Warrior
      if (attackerIndex === 2) {
        attacker = this.previousWinner
      } else {
        attacker = this.warriors[attackerIndex]
      }
      const defender = this.warriors.find((w) => w !== attacker)!
      return { attacker, defender }
    }

    const attacker = this.warriors[this.rand(2, subTick.toString())]
    const defender = this.warriors.find((w) => w !== attacker)!
    return { attacker, defender }
  }

  private rand(max:number, additional?:string) {
    return deterministicRandom(max, `${this.battleId()}-${this.tick}${additional}`, this.seed)
  }

  battleId() {
    return `battle-${this.warriors[0].id}-${this.warriors[1].id}-${this.startingTick}`
  }

  private log(...args:any[]) {
    log(args)
  }
}

export default Battle
