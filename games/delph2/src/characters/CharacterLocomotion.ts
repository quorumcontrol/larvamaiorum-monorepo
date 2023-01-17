import { Entity, Vec3 } from "playcanvas";
import { createScript, attrib } from "../utils/createScriptDecorator";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { Locomotion } from "../syncing/schema/DelphsTableState";


@createScript("characterLocomotion")
class CharacterLocomotion extends ScriptTypeBase {

  @attrib({ type: "entity" })
  animatedEntity: Entity

  speed: number = 0
  destination?: Vec3
  focus: Vec3
  serverPosition?: Vec3
  state?: Locomotion

  initialize() {
    this.focus = new Vec3()
    // this.state = LocomotionState.frozen
  }

  setSpeed(speed: number) {
    this.speed = speed
    if (this.animatedEntity) {
      this.animatedEntity.anim!.setFloat('speed', speed)
    }
  }

  setServerPosition(point: Vec3) {
    this.serverPosition = point
  }

  setDestination(dest: Vec3) {
    this.destination = dest
  }

  setFocus(focus: Vec3) {
    this.focus.copy(focus)
  }

  update(dt: number) {
    if (!this.state) {
      return
    }
    if (this.entity.getPosition().distance(this.serverPosition!) > 1) {
      this.entity.setPosition(this.serverPosition!.x, 0, this.serverPosition!.z)
    }
    const absSpeed = Math.abs(this.speed)
    if (absSpeed > 0 && this.serverPosition && this.entity.getPosition().distance(this.serverPosition) > 0.1) {
      const current = this.entity.getPosition()
      // const newPosition = new Vec3().sub2(this.serverPosition, current).normalize().mulScalar(absSpeed * dt).add(current)
      // newPosition.y = 0
      // const newPosition = current.add(vector)
      const vector = new Vec3().sub2(this.serverPosition, current).normalize().mulScalar(absSpeed * dt)
      vector.y = 0
      const newPosition = current.add(vector)
      // console.log(this.serverPosition, newPosition)
      this.entity.setPosition(newPosition)
    }
    if (this.entity.getPosition().distance(this.focus) > 0.05) {
      this.entity.lookAt(this.focus.x, 0, this.focus.z)
    }
  }

  setLocomotion(locomotionState:Locomotion) {
    this.state = locomotionState

    // this.deer = deerstate
    this.entity.setPosition(locomotionState.position.x, 0, locomotionState.position.z)
    locomotionState.onChange = (_changes) => {
      // console.log("changes: ", changes)
      this.setSpeed(locomotionState.speed)
    }
    locomotionState.destination.onChange = () => {
      // console.log("new destination: ", player.destination.toJSON())
      this.setDestination(new Vec3(locomotionState.destination.x, 0, locomotionState.destination.z))
    }
    locomotionState.position.onChange = () => {
      // console.log(' new position: ', locomotionState.position.toJSON())
      this.setServerPosition(new Vec3(locomotionState.position.x, 0, locomotionState.position.z))
    }
    locomotionState.focus.onChange = () => {
      // console.log(this.entity.name, ' new focus: ', locomotionState.focus.x, 0, locomotionState.focus.z)
      this.setFocus(new Vec3(locomotionState.focus.x, 0, locomotionState.focus.z))
    }
    this.entity.fire('new locomotion', locomotionState)
  }

}

export default CharacterLocomotion;
