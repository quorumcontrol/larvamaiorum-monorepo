import { Entity, Vec3 } from "playcanvas";
import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import PlayingField from "../game/PlayingField";
import { randomInt } from "../utils/randoms";

export const DEER_ARRIVED_EVT = 'deer:arrived'
export const DEER_CLOSE_TO_DESTINATION_EVT = 'deer:closeToDest'

@createScript("deerLocomotion")
class DeerLocomotion extends ScriptTypeBase {

  speed: number = 0
  destination: Vec3
  rootOriginal: Vec3

  deerModel: Entity
  root: Entity
  board: Entity
  boardScript: PlayingField
  clock: number = 0

  initialize() {
    this.board = mustFindByName(this.app.root, 'gameBoard')
    this.boardScript = this.getScript<PlayingField>(this.board, 'playingField')!
    this.deerModel = mustFindByName(this.entity, 'deerModel')
    this.entity.on(DEER_ARRIVED_EVT, () => {
      this.randomDestination()
    })
    this.randomDestination()
  }

  setSpeed(speed: number) {
    if (speed > 0 && this.destination) {
      this.entity.lookAt(this.destination.x, 0, this.destination.z)
    }
    this.speed = speed
    this.deerModel.anim!.setFloat('speed', speed)
  }

  setDestination(dest: Vec3) {
    this.destination = new Vec3(dest.x, 0, dest.z)
    this.entity.lookAt(this.destination.x, 0, this.destination.z)
    this.setSpeed(4)
  }

  randomDestination() {
    const gump = this.app.root.findByTag('wootgump')
    this.setDestination(gump[randomInt(gump.length - 1)].getPosition())
  }

  update(dt: number) {
    // this.entity.lookAt(this.destination)
    if (this.speed > 0 && this.destination) {
      const current = this.entity.getPosition()
      const vector = new Vec3().sub2(this.destination, current).normalize().mulScalar(this.speed * dt)
      vector.y = 0
      const newPosition = current.add(vector)
      this.entity.setPosition(newPosition)
      const distance = newPosition.distance(this.destination)
      if (distance <= 0.25) {
        this.setSpeed(0)
        this.entity.fire(DEER_ARRIVED_EVT, this.destination)
        return
      }
      if (distance <= 2) {
        this.setSpeed(1)
        this.entity.fire(DEER_CLOSE_TO_DESTINATION_EVT, this.destination)
        return
      }
      this.setSpeed(4)
    }
  }

}

export default DeerLocomotion;
