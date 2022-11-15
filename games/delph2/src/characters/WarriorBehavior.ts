import { AnimComponent, Entity } from "playcanvas";
import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import WarriorLocomotion from "./WarriorLocomotion";
import Warrior from "../game/Warrior";

export const ARRIVED_EVT = 'warrior:arrived'
export const CLOSE_TO_DESTINATION_EVT = 'warrior:closeToDest'
export const BATTLE_OVER_WIN_EVT = 'warrior:battleOverWinEvt'

export enum State {
  move,
  harvest,
  battle,
  dead,
  taunt
}

@createScript("warriorBehavior")
class WarriorBehavior extends ScriptTypeBase {

  state:State
  anim:AnimComponent
  locomotion:WarriorLocomotion

  camera:Entity
  nameScreen:Entity
  healthBar:Entity
  warrior?: Warrior
  battling?:Entity

  timeSinceHeal = 0
  
  initialize() {
    this.state = State.move
    this.anim = mustFindByName(this.entity, 'viking').anim!
    this.anim.setFloat('health', 100)
    const locomotion = this.getScript<WarriorLocomotion>(this.entity, 'warriorLocomotion')
    if (!locomotion) {
      throw new Error('no locomotion')
    }
    this.locomotion = locomotion
    this.nameScreen = mustFindByName(this.entity, 'PlayerNameScreen')
    this.camera = mustFindByName(this.app.root, 'Camera')
    this.healthBar = mustFindByName(this.nameScreen, 'HealthBar')
  }

  setWarrior(warrior:Warrior) {
    this.warrior = warrior
    this.entity.fire('newWarrior', warrior)
  }

  update(dt: number) {
    this.nameScreen.lookAt(this.camera.getPosition())
    this.nameScreen.rotateLocal(0, 180, 0)
    if (this.warrior) {
      this.healthBar.element!.width = this.warrior!.currentHealth / this.warrior!.initialHealth * 150
    }

    this.timeSinceHeal += dt
    // TODO: this needs to be more consistent than this when synced
    if (this.timeSinceHeal > 1) {
      this.warrior?.recover(0.05)
      this.timeSinceHeal = 0
    }
    const gumps = this.app.root.findByTag('harvestable')
    gumps.forEach((gumpNode) => {
      const gump = gumpNode as Entity
      if (this.entity.getPosition().distance(gump.getPosition()) < 0.6) {
        const start = gump.getLocalPosition()
        gump.tween(start).to({x: start.x, y: start.y + 40, z: start.z}, 2.0).on('complete', () => {
          gump.destroy()
          this.warrior!.wootgumpBalance += 1
        }).start()
      }
    })

    if ([State.battle, State.dead].includes(this.state)) {
      return
    }
  }

  setState(newState:State) {
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
      case State.taunt:
        //TODO this should be an animation, but for now idle it
        this.anim.setBoolean('battling', false)
        this.anim.setFloat('health', 100)
        this.locomotion.setSpeed(0)
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

}

export default WarriorBehavior;
