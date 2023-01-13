import { Vec2 } from "playcanvas"
import { Locomotion, LocomotionState } from "../rooms/schema/DelphsTableState"

class LocomotionLogic {
  position: Vec2
  destination: Vec2

  state: Locomotion

  private addionalSpeed = 0.0 // todo

  constructor(state: Locomotion) {
    this.state = state
    this.position = new Vec2(state.position.x, state.position.z)
  }

  update(dt: number) {
    if (this.state.locomotionState === LocomotionState.move) {
      const current = new Vec2(this.state.position.x, this.state.position.z)
      const dest = new Vec2(this.state.destination.x, this.state.destination.z)
      const vector = new Vec2().sub2(dest, current).normalize().mulScalar(this.state.speed * dt)
      current.add(vector)
      this.state.position.assign({
        x: current.x,
        z: current.y,
      })
      this.position = current
      this.setSpeedBasedOnDestination()
    }
  }

  freeze() {
    this.setState(LocomotionState.frozen)
  }

  unfreeze() {
    if (this.state.locomotionState === LocomotionState.frozen) {
      this.setState(LocomotionState.move)
    }
  }

  setPosition(x: number, z: number) {
    this.position = new Vec2(this.state.position.x, this.state.position.z)
  }

  setAdditionalSpeed(additionalSpeed:number) {
    this.addionalSpeed = additionalSpeed
  }

  setDestination(x: number, z: number) {
    this.state.destination.assign({
      x,
      z,
    })
    this.state.focus.assign({
      x,
      z,
    })
    this.destination = new Vec2(x, z)
    this.state.assign({
      locomotionState: LocomotionState.move
    })
    this.setSpeedBasedOnDestination()
  }

  distanceToDestination() {
    return new Vec2(this.state.position.x, this.state.position.z).distance(new Vec2(this.state.destination.x, this.state.destination.z))
  }

  speed() {
    return this.state.speed
  }

  setState(state:LocomotionState) {
    this.state.assign({
      locomotionState: state,
    })
  }

  private setSpeedBasedOnDestination() {
    const dist = this.distanceToDestination()
    if (dist > 2) {
      this.setSpeed(this.state.maxSpeed)
      return
    }
    if (dist > 0.25) {
      this.setSpeed(this.state.walkSpeed)
      return
    }
    this.state.assign({
      locomotionState: LocomotionState.arrived
    })
    this.setSpeed(0)
  }

  private setSpeed(speed: number) {
    this.state.speed = (speed >= (this.state.maxSpeed - 0.5)) ? speed + this.addionalSpeed : speed
  }

}

export default LocomotionLogic
