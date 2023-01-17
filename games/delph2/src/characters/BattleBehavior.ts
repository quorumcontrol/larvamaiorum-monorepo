import { Entity, SoundComponent, AnimComponent } from "playcanvas";
import { createScript } from "../utils/createScriptDecorator";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { BattleCommands } from "../syncing/schema/DelphsTableState";


@createScript("battleBehavior")
class BattleBehavior extends ScriptTypeBase {

  state: BattleCommands
  anim: AnimComponent
  sounds?:SoundComponent

  playOnce = false

  effects: {
    attack?: any
    block?: any
    hit?: any
  }

  initialize() {
    this.effects = {}
    const soundEntity = this.entity.findByName('Sounds')
    if (soundEntity) {
      this.sounds = (soundEntity as Entity).sound!
    }
    const effectsEntity = this.entity.findByName("effects") as Entity || undefined
    if (effectsEntity) {
      this.effects = {
        attack: this.getEmitter(effectsEntity, "attack"),
        block: this.getEmitter(effectsEntity, "block"),
        hit: this.getEmitter(effectsEntity, "hit"),
      }
    }
  }

  private getEmitter(effectsEntity:Entity, name:string) {
    const entity = effectsEntity.findByName(name) as Entity|undefined
    if (entity) {
      return this.getScript(entity, "effekseerEmitter")
    }
  }

  setup(state:BattleCommands, anim:AnimComponent) {
    this.state = state
    this.anim = anim
  }

  update(_dt: number) {
    if (!this.state) {
      return
    }
    this.handleBattleEffects()
  }

  handleBattleEffects() {
    this.handleImpactStrength()
    this.handleSwingDirection()
  }

  private handleSwingDirection() {
    this.anim.setInteger('attack', this.state.swingDirection)
    if (this.state.swingDirection > 0 && !this.playOnce) {
      console.log("play")
      this.playOnce = true
      this.effects.attack?.play()
    }
    if (this.state.swingDirection === 0) {
      this.playOnce = false
    }
  }

  private handleImpactStrength() {
    this.anim.setInteger('impactAmount', this.state.impactStrength)
    // if (this.state.impactStrength > 0) {
    //   this.effects.hit?.play()
    // }
    // if (this.state.impactStrength < 0) {
    //   this.effects.block?.play()
    // }
  }

}

export default BattleBehavior