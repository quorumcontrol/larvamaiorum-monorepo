import { Entity, Application } from 'playcanvas'
import WarriorBehavior, { State } from '../characters/WarriorBehavior'
import mustFindByName from '../utils/mustFindByName'
import mustGetScript from '../utils/mustGetScript'
import { randomFloat, randomInt } from '../utils/randoms'

class Battle {
  app: Application
  started = false
  warriors: Entity[]
  clock = 0
  over = false
  completed = false

  effect?:Entity

  constructor(app: Application, warriors?: Entity[]) {
    this.warriors = warriors || []
    this.app = app
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
      this.warriors.forEach((w) => {
        const warrior = mustGetScript<WarriorBehavior>(w, 'warriorBehavior').warrior!
        if (!warrior.isAlive()) {
          warrior.recover(1.00)
        }
        mustGetScript<WarriorBehavior>(w, 'warriorBehavior').setState(State.move)
      })
      this.completed = true
    }

  }

  addWarrior(warrior: Entity) {
    this.warriors.push(warrior)
  }

  endIt() {
    const behaviors = this.warriors.map((warriorElement) => {
      return mustGetScript<WarriorBehavior>(warriorElement, 'warriorBehavior')
    })

    const warriors = behaviors.map((behavior) => {
      const warrior = behavior.warrior
      if (!warrior) {
        throw new Error('missing warrior')
      }
      return warrior
    })

    while (!warriors.some((w) => !w.isAlive())) {
      const attackerIdx = randomFloat() >= 0.5 ? 0 : 1
      const attacker = warriors[attackerIdx]
      const defender = warriors[(attackerIdx + 1) % this.warriors.length]
      const attackRoll = randomInt(attacker.currentAttack())
      const defenseRoll = randomInt(defender.currentDefense())
      if (attackRoll > defenseRoll) {
        defender.currentHealth -= (attackRoll - defenseRoll)
      }
    }

    warriors.forEach((warrior, i) => {
      if (warrior.isAlive()) {
        behaviors[i].setState(State.move)
      } else {
        behaviors[i].setState(State.dead)
      }
    })

    this.over = true
    this.clock = 0
    this.effect?.destroy()
  }

  go() {
    if (this.started) {
      return
    }
    this.started = true
    this.setBattling()
    const effect = mustFindByName(this.app.root, 'BattleEffect').clone()
    this.app.root.addChild(effect)
    effect.enabled = true
    effect.setPosition(this.warriors[0].getPosition().add(this.warriors[1].getPosition()).divScalar(2))
    mustGetScript<any>(effect, 'effekseerEmitter').play()
    this.effect = effect
    // this.moveToPositions()
  }

  private setBattling() {
    this.warriors.forEach((w, i) => {
      mustGetScript<WarriorBehavior>(w, 'warriorBehavior').setState(State.battle)
      w.lookAt(this.warriors[(i + 1) % this.warriors.length].getPosition())
    })
  }
}

export default Battle
