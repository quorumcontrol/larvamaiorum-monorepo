import { Entity, SoundComponent } from "playcanvas";
import { RovingAreaAttack } from "../syncing/schema/DelphsTableState";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";

@createScript("rovingAttack")
class RovingAttack extends ScriptTypeBase {

  state?:RovingAreaAttack
  effectTemplate: Entity
  existingEffect?: Entity

  // dustCloudTemplate: Entity
  // existingDustCloud?: Entity

  sound:SoundComponent

  initialize() {
    this.effectTemplate = mustFindByName(this.entity, "EffectEntity")
    // this.dustCloudTemplate = mustFindByName(this.app.root, "DustCloud")
    this.sound = mustFindByName(this.entity, "Sound").sound!
  }

  movePosition() {
    if (!this.state) {
      throw new Error("missing state")
    }
    if (this.existingEffect) {
      // if (this.existingDustCloud) {
      //   this.existingDustCloud.destroy()
      // }
      // const cloud = this.dustCloudTemplate.clone()
      // cloud.setPosition(this.existingEffect.getPosition())
      // cloud.translate(0,2,0)
      // cloud.enabled = true
      // this.app.root.addChild(cloud)
      // this.existingDustCloud = cloud

      this.existingEffect.destroy()
    }
    this.entity.setPosition(this.state.position.x, 0, this.state.position.z)
    const effect = this.effectTemplate.clone()
    this.entity.addChild(effect)
    effect.enabled = true
    this.existingEffect = effect
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
