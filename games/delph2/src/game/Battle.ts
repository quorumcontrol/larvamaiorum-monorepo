import { Entity, Application, SoundComponent } from 'playcanvas'
import WarriorBehavior from '../characters/WarriorBehavior'
import { State } from '../syncing/schema/DelphsTableState'
import mustFindByName from '../utils/mustFindByName'
import mustGetScript from '../utils/mustGetScript'
import { randomFloat, randomInt } from '../utils/randoms'

class Battle {
  app: Application
  started = false
  warriors: Entity[]
  behaviors: WarriorBehavior[]
  clock = 0
  over = false
  completed = false
  wootgumpPot = 0

  effect?:Entity

  constructor(app: Application, warriors?: Entity[]) {
    this.warriors = warriors || []
    this.behaviors = this.warriors.map((warriorElement) => {
      return mustGetScript<WarriorBehavior>(warriorElement, 'warriorBehavior')
    })
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
      this.behaviors.forEach((b, i) => {
        if (!b.warrior) {
          throw new Error('no warrior')
        }
        if (!b.warrior.isAlive()) {
          b.warrior.recover(1.00)
        }
       b.setState(State.move)
      })
      this.completed = true
    }

  }

  endIt() {
    const warriors = this.behaviors.map((behavior) => {
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
        this.behaviors[i].setState(State.move)
      } else {
        const gumpTaken = Math.floor(this.behaviors[i].warrior!.wootgumpBalance * 0.5)
        this.behaviors[i].warrior!.wootgumpBalance -= gumpTaken
        this.wootgumpPot += gumpTaken
        this.behaviors[i].setState(State.dead)
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
    const effect = mustFindByName(this.app.root, 'BattleEffects').clone()
    this.app.root.addChild(effect)
    effect.enabled = true
    effect.setPosition(this.warriors[0].getPosition().add(this.warriors[1].getPosition()).divScalar(2))
    this.effect = effect
    this.playEffects()
  }

  private playEffects() {
    if (!this.effect) {
      throw new Error('no effect')
    }
    const battleSound = mustFindByName(this.effect, "BattleSound").findComponent('sound') as SoundComponent
    Object.values(battleSound.slots).forEach((slot) => {
      console.log('play sound', slot.name)
      slot.play()
    })

    const emitter = mustFindByName(this.effect, 'BattleEffect')
    mustGetScript<any>(emitter, 'effekseerEmitter').play()
  }

  private setBattling() {
    this.warriors.forEach((w, i) => {
      mustGetScript<WarriorBehavior>(w, 'warriorBehavior').setState(State.battle)
      w.lookAt(this.warriors[(i + 1) % this.warriors.length].getPosition())
    })
  }
}

export default Battle
