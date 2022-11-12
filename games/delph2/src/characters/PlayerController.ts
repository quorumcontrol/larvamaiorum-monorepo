import { Entity, RaycastResult, Vec3 } from "playcanvas";
import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";
import { SELECT_EVT } from "../controls/CellSelector";
import { ScriptTypeBase } from "../types/ScriptTypeBase";

@createScript("playerController")
class PlayerController extends ScriptTypeBase {

  speed: number = 0
  destination: Vec3
  rootOriginal: Vec3

  viking: Entity
  root: Entity
  clock: number = 0

  initialize() {

    this.viking = mustFindByName(this.entity, "viking")

    this.app.on(SELECT_EVT, (result:RaycastResult) => {
      this.setDestination(result.point)
    })
  }

  setSpeed(speed: number) {
    this.speed = speed
    this.viking.anim!.setFloat('speed', speed)
  }

  setDestination(dest: Vec3) {
    this.destination = new Vec3(dest.x, 0, dest.z)
    this.entity.lookAt(this.destination.x, 0, this.destination.z)
    console.log('look at', this.destination)
    this.setSpeed(4)
  }

  update(dt: number) {
    this.entity.lookAt(this.destination)
    if (this.speed > 0) {

      const current = this.entity.getPosition()
      const vector = new Vec3().sub2(this.destination, current).normalize().mulScalar(this.speed * dt)
      vector.y = current.y
      const newPosition = current.add(vector)
      this.entity.setPosition(newPosition)
      const distance = newPosition.distance(this.destination)
      if (distance <= 0.25) {
        this.setSpeed(0)
        return
      }
      if (distance <= 8) {
        this.setSpeed(2)
      }
    }
  }

}

export default PlayerController;
