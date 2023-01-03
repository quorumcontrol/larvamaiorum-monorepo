import { Battle, State } from '../rooms/schema/DelphsTableState'
import { randomFloat, randomInt } from './utils/randoms'
import Warrior from './Warrior'

class BattleLogic {
  id:string
  state: Battle

  started = false
  warriors: Warrior[]
  clock = 0
  over = false
  completed = false
  wootgumpPot = 0

  winner?: Warrior
  losers: Warrior[]

  constructor(id:string, warriors: Warrior[], state:Battle) {
    this.id = id
    this.warriors = warriors
    this.state = state
    this.losers = []
  }

  update(dt: number) {
    if (!this.started) {
      return
    }
    this.clock += dt

    if (this.clock > 2 && !this.over) {
      if (!this.over) {
        return this.endIt()
      }
    }

    if (this.clock > 5 && !this.completed) {
      console.log('completing battle')
      this.completed = true
    }
  }

  endIt() {

    const warriors = this.warriors

    while (!warriors.some((w) => !w.isAlive())) {
      const attackerIdx = randomFloat() >= 0.5 ? 0 : 1
      const attacker = warriors[attackerIdx]
      const defender = warriors[(attackerIdx + 1) % this.warriors.length]
      const attackRoll = randomInt(attacker.currentAttack())
      const defenseRoll = randomInt(defender.currentDefense())
      if (attackRoll > defenseRoll) {
        defender.state.currentHealth -= (attackRoll - defenseRoll)
      }
    }

    warriors.forEach((warrior, i) => {
      warrior.clearItem()
      if (warrior.isAlive()) {
        warrior.sendMessage("Winner!")
        warrior.setState(State.move)
        this.winner = warrior
      } else {
        this.losers.push(warrior)
        const gumpTaken = Math.floor(warrior.state.wootgumpBalance * 0.5)
        warrior.incGumpBalance(gumpTaken * -1)
        warriors[(i+1) % warriors.length].incGumpBalance(gumpTaken)
        console.log("warrior dead from battle")
        warrior.dieForTime(6, "You lose.")
      }
    })

    this.over = true
    this.clock = 0
  }

  go() {
    if (this.started) {
      return
    }
    console.log('battle started')
    this.started = true
    this.setBattling()
  }

  private setBattling() {
    this.warriors.forEach((w, i) => {
      w.setState(State.battle)
      w.sendMessage('Battle!')
    })
  }
}

export default BattleLogic
