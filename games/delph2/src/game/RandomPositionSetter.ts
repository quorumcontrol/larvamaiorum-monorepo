import { randomBounded } from "../utils/randoms";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { createScript, attrib } from "../utils/createScriptDecorator";

@createScript("randomPositionSetter")
class RandomPositionSetter extends ScriptTypeBase {

  @attrib({ type: "number", default: 0.75 })
  playInterval: number;

  @attrib({ type: "boolean", default: true })
  jitter: boolean

  effect: any
  timeSincePlay = 0

  private nextInterval:number

  initialize() {
    this.setNextInterval()
  }

  update(dt:number) {
    this.timeSincePlay += dt
    if (this.timeSincePlay >= this.nextInterval) {
      const [x,z] = [randomBounded(30),randomBounded(30)]
      this.entity.setPosition(x, 0, z)
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

export default RandomPositionSetter
