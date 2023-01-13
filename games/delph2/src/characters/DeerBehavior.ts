import { Entity, Vec3, SoundComponent } from "playcanvas";
import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { Deer, BehavioralState } from "../syncing/schema/DelphsTableState";
import { randomInt } from "../utils/randoms";
import mustGetScript from "../utils/mustGetScript";
import CharacterLocomotion from "./CharacterLocomotion";


@createScript("deerBehavior")
class DeerBehavior extends ScriptTypeBase {

  state: BehavioralState
  sound: SoundComponent
  deer: Entity

  initialize() {
    this.deer = mustFindByName(this.entity, "deerModel")
    this.state = BehavioralState.move
    this.sound = mustFindByName(this.entity, "Sound").sound!
  }

  setState(newState:BehavioralState) {
    this.deer.anim!.setBoolean('deerAttack', (newState === BehavioralState.battle))

    if ([BehavioralState.chasing, BehavioralState.battle].includes(newState)) {
      this.sound.slots[randomInt(2).toString()].play()
    }
  }

  update(dt: number) {
    if (!this.deer) {
      return
    }
  }

  setDeerState(deerstate:Deer) {
    // this.deer = deerstate
    console.log('deer set', deerstate.toJSON())
    deerstate.onChange = (_changes) => {
      this.setState(deerstate.behavioralState)
    }
    mustGetScript<CharacterLocomotion>(this.entity, 'characterLocomotion').setLocomotion(deerstate.locomotion)

    this.entity.fire('new Deer', deerstate)
  }

}

export default DeerBehavior;
