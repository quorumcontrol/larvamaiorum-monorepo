import { randomInt } from "../utils/randoms";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { createScript } from "../utils/createScriptDecorator";
import mustGetScript from "../utils/mustGetScript";

@createScript("firePot")
class FirePot extends ScriptTypeBase {

  effect: any
  timeSincePlay = 0
  playInterval:number

  initialize() {
    this.playInterval = 0.75 + (randomInt(200) / 1000)
    this.effect = mustGetScript(this.entity, "effekseerEmitter")
  }

  update(dt:number) {
    this.timeSincePlay += dt
    if (this.timeSincePlay >= this.playInterval) {
      this.effect.play()
      this.timeSincePlay = 0
    }
  }

}

export default FirePot
