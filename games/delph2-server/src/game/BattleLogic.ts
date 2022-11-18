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

  constructor(id:string, warriors: Warrior[], state:Battle) {
    this.id = id
    this.warriors = warriors
    this.state = state
  }

  update(dt: number) {
    if (!this.started) {
      return
    }
    this.clock += dt
    if (this.clock > 1 && !this.over) {
      if (!this.over) {
        return this.endIt()
      }
    }

    if (this.clock > 5 && !this.completed) {
      console.log('completing battle')
      this.warriors.forEach((b, i) => {
        if (!b.isAlive()) {
          b.recover(1.00)
        }
        console.log('recovering warrior: ', b.id)
        b.setState(State.move)
      })
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
      if (warrior.isAlive()) {
        warrior.setState(State.move)
      } else {
        const gumpTaken = Math.floor(warrior.wootgumpBalance * 0.5)
        warrior.wootgumpBalance -= gumpTaken
        this.wootgumpPot += gumpTaken
        warrior.setState(State.dead)
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
    // const effect = mustFindByName(this.app.root, 'BattleEffect').clone()
    // this.app.root.addChild(effect)
    // effect.enabled = true
    // effect.setPosition(this.warriors[0].getPosition().add(this.warriors[1].getPosition()).divScalar(2))
    // mustGetScript<any>(effect, 'effekseerEmitter').play()
    // this.effect = effect
    // this.moveToPositions()
  }

  private setBattling() {
    this.warriors.forEach((w, i) => {
      w.setState(State.battle)
    })
  }
}

export default BattleLogic
