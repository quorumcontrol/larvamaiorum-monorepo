import { Entity, Vec3 } from "playcanvas";
import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import PlayingField from "../game/PlayingField";
import { Deer } from "../syncing/schema/DelphsTableState";

export const DEER_ARRIVED_EVT = 'deer:arrived'
export const DEER_CLOSE_TO_DESTINATION_EVT = 'deerf:closeToDest'

@createScript("deerLocomotion")
class DeerLocomotion extends ScriptTypeBase {

  speed: number = 0
  destination: Vec3
  serverPosition: Vec3

  deer: Entity

  initialize() {
    this.deer = mustFindByName(this.entity, "deerModel")
  }

  setSpeed(speed: number) {
    if (speed > 0 && this.destination) {
      this.entity.lookAt(this.destination.x, 0, this.destination.z)
    }
    this.speed = speed
    if (!this.deer) {
      console.error('here we are', this.entity.name, this.entity.getGuid(), this)
    }
    this.deer.anim!.setFloat('speed', speed)
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
    if (!this.deer) {
      return
    }
    if (this.entity.getPosition().distance(this.serverPosition) > 1) {
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

  setDeerState(deerstate:Deer) {
    // this.deer = deerstate
    console.log('deer set', deerstate.toJSON())
    this.entity.setPosition(deerstate.position.x, 0, deerstate.position.z)
    deerstate.onChange = (changes) => {
      // console.log("changes: ", changes)
      this.setSpeed(deerstate.speed)
      // this.setState(deerstate.state)
    }
    deerstate.destination.onChange = () => {
      // console.log("new destination: ", player.destination.toJSON())
      this.setDestination(new Vec3(deerstate.destination.x, 0, deerstate.destination.z))
      // this.locomotion.setDestination(player.destination.x, player.destination.z)
    }
    deerstate.position.onChange = () => {
      // console.log(' new position: ', player.position.toJSON())
      this.setServerPosition(new Vec3(deerstate.position.x, 0, deerstate.position.z))
    }
    this.entity.fire('new Deer', deerstate)
  }

}

export default DeerLocomotion;
