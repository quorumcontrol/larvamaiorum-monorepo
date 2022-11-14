import { Entity, RaycastResult, Vec3 } from "playcanvas";
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
  rootOriginal: Vec3

  viking: Entity
  root: Entity
  board: Entity
  boardScript: PlayingField
  clock: number = 0

  initialize() {
    this.board = mustFindByName(this.app.root, 'gameBoard')
    this.boardScript = this.getScript<PlayingField>(this.board, 'playingField')!
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

  setDestination(dest: Vec3) {
    this.destination = new Vec3(dest.x, 0, dest.z)
    this.entity.lookAt(this.destination.x, 0, this.destination.z)
    this.setSpeed(4)
  }

  randomDestination() {
    this.setDestination(this.boardScript.randomPosition())
  }

  update(dt: number) {
    // this.entity.lookAt(this.destination)
    if (this.speed > 0 && this.destination) {
      const current = this.entity.getPosition()
      const vector = new Vec3().sub2(this.destination, current).normalize().mulScalar(this.speed * dt)
      vector.y = current.y
      const newPosition = current.add(vector)
      this.entity.setPosition(newPosition)
      const distance = newPosition.distance(this.destination)
      if (distance <= 0.25) {
        this.setSpeed(0)
        this.entity.fire(ARRIVED_EVT, this.destination)
        return
      }
      if (distance <= 2) {
        this.setSpeed(2)
        this.entity.fire(CLOSE_TO_DESTINATION_EVT, this.destination)
        return
      }
      this.setSpeed(4)
    }
  }

}

export default WarriorLocomotion;
