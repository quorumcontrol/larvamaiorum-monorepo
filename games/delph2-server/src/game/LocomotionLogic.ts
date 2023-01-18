import { Room } from "colyseus"
import { Vec2, math } from "playcanvas"
import { Locomotion, LocomotionState } from "../rooms/schema/DelphsTableState"

class LocomotionLogic {
  position: Vec2
  destination: Vec2
  focus: Vec2
  frontPoint: Vec2

  private forward:Vec2

  private frontOfCharacterOffset:number

  private state: Locomotion

  private addionalSpeed = 0.0 // todo
  private limiter?:number

  private debugRoom?:Room

  // frontOfCharacterOffset is the halfextent from the pivot point to the front of the character
  // this is useful because deer and humans have different sizes and so when we are making them not overlap, we should use the front point
  // and not the pivot point
  constructor(state: Locomotion, frontOfCharacterOffset:number, room?:Room) {
    this.state = state
    this.position = new Vec2(state.position.x, state.position.z)
    this.destination = new Vec2(state.destination.x, state.destination.z)
    this.focus = new Vec2(state.focus.x, state.focus.z)
    this.frontOfCharacterOffset = frontOfCharacterOffset

    this.forward = new Vec2()
    this.updateForward()

    this.frontPoint = new Vec2()
    this.updateFrontPoint()

    this.debugRoom = room
  }

  update(dt: number) {
    if (this.state.locomotionState === LocomotionState.move) {
      this.position.set(this.state.position.x, this.state.position.z)
      this.destination.set(this.state.destination.x, this.state.destination.z)
      const vector = new Vec2().sub2(this.destination, this.position).normalize().mulScalar(Math.abs(this.state.speed) * dt)
      this.position.add(vector)
      this.state.position.assign({
        x: this.position.x,
        z: this.position.y,
      })
      this.updateForward()
      this.updateFrontPoint()
      this.setSpeedBasedOnDestination()
      if (this.debugRoom) {
        this.debugRoom.broadcast("debug", {x: this.frontPoint.x, y: this.frontPoint.y})
      }
    }
  }

  walkSpeed() {
    return this.state.walkSpeed
  }

  getState(): LocomotionState {
    return this.state.locomotionState
  }

  freeze() {
    this.setState(LocomotionState.frozen)
    this.setSpeed(0)
  }

  unfreeze() {
    if (this.state.locomotionState === LocomotionState.frozen) {
      this.setState(LocomotionState.move)
    }
  }

  setPosition(x: number, z: number) {
    this.state.position.assign({ x, z })
    this.position.set(x, z)
  }

  setAdditionalSpeed(additionalSpeed: number) {
    this.addionalSpeed = additionalSpeed
  }

  setDestinationAndFocus(x: number, z: number) {
    this.setFocus(x, z)
    this.setDestination(x, z)
  }

  setFocus(x: number, z: number) {
    this.state.focus.assign({
      x,
      z,
    })
    this.focus.set(x, z)
  }

  setDestination(x: number, z: number) {
    this.state.destination.assign({
      x,
      z,
    })

    this.destination.set(x, z)
    this.state.assign({
      locomotionState: LocomotionState.move
    })
    this.setSpeedBasedOnDestination()
  }

  distanceToDestination() {
    return this.position.distance(this.destination)
  }

  speed() {
    return this.state.speed
  }

  setState(state: LocomotionState) {
    this.state.assign({
      locomotionState: state,
    })
  }

  setLimiter(limit?:number) {
    this.limiter = limit
  }

  clearLimiter() {
    this.limiter = undefined
  }

  private updateFrontPoint() {
    this.frontPoint.add2(this.position, this.forward.mulScalar(this.frontOfCharacterOffset))
  }

  private updateForward() {
    return this.forward.sub2(this.focus, this.position).normalize()
  }

  private angleToDestination() {
    const targetDir = new Vec2().sub2(this.destination, this.position).normalize();
    const angleInRadians = Math.acos(targetDir.dot(this.forward));
    return angleInRadians * math.RAD_TO_DEG;
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

    if (this.limiter && speed > this.limiter) {
      this.state.speed = this.limiter
    }

    if (this.angleToDestination() > 100) {
      this.state.speed *= -1
    }
  }

}

export default LocomotionLogic
