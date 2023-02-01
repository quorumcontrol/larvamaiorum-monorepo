import { Entity, SoundComponent } from "playcanvas";
import { RovingAreaAttack } from "../syncing/schema/DelphsTableState";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";
import mustGetScript from "../utils/mustGetScript";

@createScript("rovingAttack")
class RovingAttack extends ScriptTypeBase {

  state?:RovingAreaAttack
  // effectTemplate: Entity
  effect: Entity

  effectScript: any

  // dustCloudTemplate: Entity
  // existingDustCloud?: Entity

  sound:SoundComponent

  initialize() {
    this.effect = mustFindByName(this.entity, "EffectEntity")
    this.effectScript = mustGetScript(this.effect, "effekseerEmitter")
    // this.dustCloudTemplate = mustFindByName(this.app.root, "DustCloud")
    this.sound = mustFindByName(this.entity, "Sound").sound!
  }

  movePosition() {
    if (!this.state) {
      throw new Error("missing state")
    }
    // this.effectScript.stop()
    this.effect.enabled = true
    this.entity.setPosition(this.state.position.x, 0.1, this.state.position.z)
    this.effectScript.play()
    this.playSound()
  }

  playSound() {
    Object.values(this.sound.slots).forEach((sound) => {
      sound.play()
    })
  }

  setState(state:RovingAreaAttack) {
    this.state = state
    state.position.onChange = () => {
      console.log("roving attack change")
      this.movePosition()
    }
  }


};

export default RovingAttack;
