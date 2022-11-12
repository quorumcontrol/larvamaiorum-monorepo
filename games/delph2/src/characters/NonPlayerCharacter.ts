import { Entity, Vec3 } from "playcanvas";
import PlayingField from "../game/PlayingField";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";

const ARRIVED_EVT = 'warrior:arrived'
const CLOSE_TO_DESTINATIION_EVT = 'warrior:closeToDest'

@createScript("nonPlayerCharacter")
class NonPlayerCharacter extends ScriptTypeBase {


  speed: number = 0
  destination: Vec3
  rootOriginal: Vec3

  viking: Entity
  root: Entity
  clock: number = 0

  initialize() {
    const board = mustFindByName(this.app.root, 'gameBoard')
    const boardScript = this.getScript<PlayingField>(board, 'playingField')
    if (!boardScript) {
      throw new Error('missing script')
    }
    this.viking = mustFindByName(this.entity, "viking")
    this.entity.on(CLOSE_TO_DESTINATIION_EVT, () => {
      const newDest = boardScript.randomPosition()
      this.setDestination(newDest)
    })
  }

  setSpeed(speed: number) {
    this.speed = speed
    this.viking.anim!.setFloat('speed', speed)
  }

  setDestination(dest: Vec3) {
    this.destination = new Vec3(dest.x, 0, dest.z)
    this.entity.lookAt(this.destination.x, 0, this.destination.z)
    this.setSpeed(4)
  }

  update(dt: number) {
    if (this.speed > 0) {
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
      if (distance <= 8) {
        this.entity.fire(CLOSE_TO_DESTINATIION_EVT, this.destination)
        this.setSpeed(2)
        return
      }
      this.setSpeed(4)
    }
  }

}

export default NonPlayerCharacter;
