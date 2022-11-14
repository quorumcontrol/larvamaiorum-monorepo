import { AnimComponent, Entity } from "playcanvas";
import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import WarriorLocomotion from "./WarriorLocomotion";
import { randomFloat } from "../utils/randoms";

export const ARRIVED_EVT = 'warrior:arrived'
export const CLOSE_TO_DESTINATION_EVT = 'warrior:closeToDest'
export const BATTLE_OVER_WIN_EVT = 'warrior:battleOverWinEvt'

export enum State {
  move,
  harvest,
  battle,
  dead
}

@createScript("warriorBehavior")
class WarriorBehavior extends ScriptTypeBase {

  state:State
  anim:AnimComponent
  locomotion:WarriorLocomotion

  battling?:Entity

  timeInBattle = 0
  timeDead = 0

  initialize() {
    this.state = State.move
    this.anim = mustFindByName(this.entity, 'viking').anim!
    this.anim.setFloat('health', 100)
    const locomotion = this.getScript<WarriorLocomotion>(this.entity, 'warriorLocomotion')
    if (!locomotion) {
      throw new Error('no locomotion')
    }
    this.locomotion = locomotion
    this.entity.on('battle', (otherBehavior:WarriorBehavior) => {
      if (this.state === State.battle) {
        return
      }
      this.doBattle(otherBehavior.entity)
    })
    this.entity.on(BATTLE_OVER_WIN_EVT, () => {
      this.setState(State.move)
    })
  }

  update(dt: number) {
    if (this.state === State.battle) {
      this.timeInBattle += dt
      if (this.timeInBattle >= 1) {
        if (randomFloat() > 0.75) {
          this.handleBattleOver()
        }
        this.timeInBattle = 0
      }
    }
    if (this.state === State.dead) {
      this.timeDead += dt
      if (this.timeDead >= 3) {
        if (randomFloat() > 0.6) {
          console.log('arising')
          this.setState(State.move)
        }
        this.timeDead = 0
      }
    }
    const gumps = this.app.root.findByTag('harvestable')
    gumps.forEach((gumpNode) => {
      const gump = gumpNode as Entity
      if (this.entity.getPosition().distance(gump.getPosition()) < 0.6) {
        const start = gump.getLocalPosition()
        gump.tween(start).to({x: start.x, y: start.y + 40, z: start.z}, 2.0).on('complete', () => {
          gump.destroy()
        }).start()
      }
    })

    if ([State.battle, State.dead].includes(this.state)) {
      return
    }

    const warriors = this.app.root.findByTag('warrior')
    warriors.forEach((warriorNode) => {
      if ((warriorNode as Entity).getGuid() === this.entity.getGuid()) {
        return
      }
      if (this.battling?.getGuid() === (warriorNode as Entity).getGuid()) {
        return
      }
      const state = this.getBehavior(warriorNode as Entity)
      if ([State.battle, State.dead].includes(state.state)) {
        return
      }
      if (this.entity.getPosition().distance(warriorNode.getPosition()) < 1) {
        this.doBattle(warriorNode as Entity)
      }
    })
  }

  private handleBattleOver() {
    if (randomFloat() >= 0.5) {
      if (this.battling) {
        this.battling.fire(BATTLE_OVER_WIN_EVT)
      }
      this.setState(State.dead)
      return
    }
    this.setState(State.move)
  }

  private setState(newState:State) {
    if (this.state === newState) {
      return
    }
    console.log('set state: ', newState, this.entity.name)
    this.state = newState
    switch (newState) {
      case State.move:
        this.anim.setBoolean('battling', false)
        this.anim.setFloat('health', 100)
        this.locomotion.setSpeed(4)
        return
      case State.dead:
        this.anim.setFloat('health', 0)
        this.anim.setBoolean('battling', false)
        this.locomotion.setSpeed(0)
        return
      case State.battle:
        this.anim.setBoolean('battling', true)
        this.locomotion.setSpeed(0)
        return
    }
  }

  private doBattle(otherWarrior:Entity) {
    this.battling = otherWarrior
    this.setState(State.battle)
    this.entity.lookAt(otherWarrior.getPosition())
    otherWarrior.fire('battle', this)
  }

  private getBehavior(warrior:Entity) {
    const behave = this.getScript<WarriorBehavior>(warrior, 'warriorBehavior')
    if (!behave) {
      throw new Error('no behavior')
    }
    return behave
  }

}

export default WarriorBehavior;
