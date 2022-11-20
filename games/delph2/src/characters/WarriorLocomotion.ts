import { Entity, Vec3 } from "playcanvas";
import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import PlayingField from "../game/PlayingField";

export const ARRIVED_EVT = 'warrior:arrived'
export const CLOSE_TO_DESTINATION_EVT = 'warrior:closeToDest'

@createScript("warriorLocomotion")
class WarriorLocomotion extends ScriptTypeBase {

  speed: number = 0
  destination: Vec3
  serverPosition: Vec3

  viking: Entity
  clock: number = 0

  initialize() {
    this.viking = mustFindByName(this.entity, "viking")
  }

  setSpeed(speed: number) {
    if (speed > 0 && this.destination) {
      this.entity.lookAt(this.destination.x, 0, this.destination.z)
    }
    this.speed = speed
    if (!this.viking) {
      console.error('here we are', this.entity.name, this.entity.getGuid(), this)
    }
    this.viking.anim!.setFloat('speed', speed)
  }

  setServerPosition(point: Vec3) {
    this.serverPosition = point
  }

  setDestination(dest: Vec3) {
    this.destination = dest
    if (this.entity.getPosition().distance(dest) > 0.1) {
      this.entity.lookAt(dest.x, 0, dest.z)
    }
  }

  update(dt: number) {
    if (this.entity.getPosition().distance(this.serverPosition) > 1.5) {
      this.entity.setPosition(this.serverPosition.x, 0, this.serverPosition.z)
    }
    if (this.speed > 0 && this.serverPosition && this.entity.getPosition().distance(this.serverPosition) > 0.1) {
      const current = this.entity.getPosition()
      const vector = new Vec3().sub2(this.serverPosition, current).normalize().mulScalar(this.speed * dt)
      vector.y = 0
      const newPosition = current.add(vector)
      // console.log(this.serverPosition, newPosition)
      this.entity.setPosition(newPosition)
    }
  }

}

export default WarriorLocomotion;
