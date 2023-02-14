import { Music } from "../syncing/schema/DelphsTableState";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { createScript } from "../utils/createScriptDecorator";
import { randomBounded } from "../utils/randoms";

@createScript("randomRuneMover")
class RandomRuneMover extends ScriptTypeBase {

  initialize() {
    this.goToRandomLocation()
    this.spinRandomly()
  }

  private getRandomLocation() {
    return {
      x: randomBounded(27),
      z: randomBounded(27),
    }
  }

  spinRandomly() {
    this.entity.tween(this.entity.getLocalEulerAngles()).rotate(new pc.Vec3(0,50 + randomBounded(360),0), 20, pc.SineInOut).on("complete", () => {
      this.spinRandomly()
    }).start()
  }

  goToRandomLocation() {
    const {x, z} = this.getRandomLocation()
    const position = this.entity.getLocalPosition()
    this.entity.tween(position).to({ x, y: position.y, z }, 15, pc.SineInOut).on("complete", () => {
      this.goToRandomLocation()
    }).start()
  }

}

export default RandomRuneMover