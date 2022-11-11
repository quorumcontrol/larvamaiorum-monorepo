import { Entity, RaycastResult, Vec3 } from "playcanvas";
import { ScriptTypeBase } from "../types/ScriptTypeBase";

import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";
import { SELECT_EVT } from "./CellSelector";

@createScript("playerController")
class PlayerController extends ScriptTypeBase {

  speed:number = 0
  destination:Vec3
  rootOriginal: Vec3

  viking:Entity
  root:Entity
  clock:number = 0

  initialize() {
    this.viking = mustFindByName(this.entity, "viking")

    this.app.on(SELECT_EVT, (result:RaycastResult) => {
      console.log("looking at")
      const resultPoint = result.point
      const originalY = resultPoint.y
      resultPoint.y = this.entity.getLocalPosition().y
      this.entity.lookAt(result.point)
      resultPoint.y = originalY
      this.destination = result.point
      this.setSpeed(4)
    })
  }

  setSpeed(speed:number) {
    this.speed = speed
    this.viking.anim!.setFloat('speed', speed)
  }

  update(dt:number) {
    if (this.speed > 0) {
      const current = this.entity.getPosition()
      const vector = new Vec3().sub2(this.destination, current).normalize().mulScalar(this.speed * dt)
      vector.y = current.y
      const newPosition = current.add(vector)
      this.entity.setPosition(newPosition)
      const distance = newPosition.distance(this.destination)
      if (distance <= 1) {
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
