import { randomBounded, randomInt } from "../utils/randoms";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { createScript, attrib } from "../utils/createScriptDecorator";
import mustGetScript from "../utils/mustGetScript";

@createScript("effectLooper")
class EffectLooper extends ScriptTypeBase {

  @attrib({ type: "number", default: 0.75 })
  playInterval: number;

  @attrib({ type: "boolean", default: true })
  jitter: boolean

  effect: any
  timeSincePlay = 0

  private nextInterval:number

  initialize() {
    this.setNextInterval()
    this.effect = mustGetScript(this.entity, "effekseerEmitter")
  }

  update(dt:number) {
    this.timeSincePlay += dt
    if (this.timeSincePlay >= this.nextInterval) {
      this.effect.play()
      this.timeSincePlay = 0
      this.setNextInterval()
    }
  }

  private setNextInterval() {
    this.nextInterval = this.playInterval
    if (this.jitter) {
      this.nextInterval += randomBounded(0.1)
    }
  }

}

export default EffectLooper
