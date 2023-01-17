import { Entity, Vec3, SoundComponent, AnimComponent } from "playcanvas";
import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { Deer, BehavioralState } from "../syncing/schema/DelphsTableState";
import { randomInt } from "../utils/randoms";
import mustGetScript from "../utils/mustGetScript";
import CharacterLocomotion from "./CharacterLocomotion";
import BattleBehavior from "./BattleBehavior";


@createScript("deerBehavior")
class DeerBehavior extends ScriptTypeBase {

  state: Deer
  sound: SoundComponent
  deer: Entity
  anim: AnimComponent

  initialize() {
    this.deer = mustFindByName(this.entity, "deerModel")
    this.anim = this.deer.anim!
    this.sound = mustFindByName(this.entity, "Sound").sound!
  }

  setState(newState:BehavioralState) {
    if ([BehavioralState.chasing, BehavioralState.battle].includes(newState)) {
      this.sound.slots[randomInt(2).toString()].play()
    }

    switch(newState) {
      case BehavioralState.dead:
        this.anim.setFloat('health', 0)
        break;
      case BehavioralState.move:
        this.anim.setFloat("health", 100)
        break;
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
    this.state = deerstate
    this.state.onChange = () => {
      this.setState(this.state.behavioralState)
    }
    mustGetScript<CharacterLocomotion>(this.entity, 'characterLocomotion').setLocomotion(deerstate.locomotion)
    mustGetScript<BattleBehavior>(this.entity, 'battleBehavior').setup(deerstate.battleCommands, this.anim)

    this.entity.fire('new Deer', deerstate)
  }

}

export default DeerBehavior;
