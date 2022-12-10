import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { createScript } from "../utils/createScriptDecorator";

@createScript("trap")
class Trap extends ScriptTypeBase {

  currentTween?:pc.Tween
  up: boolean = false

  riseOrFall(shouldRise:boolean) {
    if (shouldRise === this.up) {
      return
    }
    this.up = shouldRise
    if (this.currentTween) {
      this.currentTween.stop()
    }
    const local = this.entity.getLocalPosition()
    if (shouldRise) {
      console.log("close entity, rasing up")
      this.entity.children.forEach((child) => {
        child.enabled = true
      })
      this.currentTween = this.entity.tween(local).to({x: local.x, y: 0, z: local.z }, 0.5).start()
      return
    }
    // this is down
    console.log("no entity, going down")
    this.currentTween = this.entity.tween(local).to({x: local.x, y: -1.3, z: local.z }, 0.5).start().on('complete', () => {
      this.entity.children.forEach((child) => {
        child.enabled = false
      })
    })
  }

  update() {
    const warriorsAndDeer = this.app.root.findByTag("warrior").concat(this.app.root.findByTag("deer"))
    const trapPosition = this.entity.getPosition()
    const isCloseEntity = warriorsAndDeer.some((warriorOrDeer) => {
      return warriorOrDeer.getPosition().distance(trapPosition) < 3
    })
    this.riseOrFall(isCloseEntity)
  }

}

export default Trap
