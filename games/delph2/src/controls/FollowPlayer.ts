import { Entity, SineIn, Tween, Vec3 } from "playcanvas";
import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";
import { ScriptTypeBase } from "../types/ScriptTypeBase";

@createScript("followPlayer")
class FollowPlayer extends ScriptTypeBase {
    orbitCamera: any
    player: Entity

    existingTween?:Tween

    initialize(): void {
      this.orbitCamera = this.getScript(this.entity, 'orbitCamera2')!
      this.player = mustFindByName(this.app.root, 'Player')
    }

    update() {
      // this.orbitCamera.pivotPoint = new Vec3(0,2,0).add(this.player.getPosition()).add(this.player.forward.mulScalar(2))
      const newPivot = new Vec3(0,2,0).add(this.player.getPosition()).add(this.player.forward.mulScalar(5))
      const oldPivot = this.orbitCamera.pivotPoint
      if (this.existingTween) {
        return
      }
      if (newPivot.distance(oldPivot) < 0.1) {
        // this.existingTween?.stop()
        // this.existingTween = undefined
        this.orbitCamera.pivotPoint = newPivot
        return
      }

      this.existingTween = this.entity.tween(oldPivot).to(newPivot, 0.3, SineIn).on("update", () => {
        this.orbitCamera.pivotPoint = oldPivot
      }).on("complete", () => {
        this.existingTween = undefined
      }).start()
    }
}

export default FollowPlayer;
