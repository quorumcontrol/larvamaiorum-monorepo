import EventEmitter from "events";
import debug from 'debug'
import items, { getIdentifier, Inventory, InventoryItem } from './items'
import { deterministicRandom, randomInt } from "./utils/randoms";
import { State, Deer as DeerState } from '../rooms/schema/DelphsTableState'
import { Vec2 } from "playcanvas";
import Warrior from "./Warrior";

const log = debug('deer')

class Deer extends EventEmitter {
  id: string;
  state: DeerState

  gumps: Record<string,Vec2>
  warriors: Record<string, Warrior>

  position:Vec2

  constructor(state:DeerState, wootgumps: Record<string, Vec2>, warriors: Record<string, Warrior>) {
    super()
    this.id = state.id
    this.state = state
    this.position = new Vec2(state.position.x, state.position.z)
    this.gumps = wootgumps
    this.warriors = warriors
    const gump = Object.values(wootgumps)[randomInt(Object.values(wootgumps).length - 1)]
    this.setDestination(gump.x, gump.y)
  }

  update(dt:number) {
    if (this.state.state === State.move && this.state.speed > 0) {
      const current = new Vec2(this.state.position.x, this.state.position.z)
      const dest = new Vec2(this.state.destination.x, this.state.destination.z)
      const vector = new Vec2().sub2(dest, current).normalize().mulScalar(this.state.speed * dt)
      current.add(vector)
      this.state.position.assign({
        x: current.x,
        z: current.y,
      })
      this.position = current
      const distance = current.distance(dest)
      if (distance <= 0.25) {
        this.setSpeed(0)
        const gump = Object.values(this.gumps)[randomInt(Object.values(this.gumps).length - 1)]
        this.setDestination(gump.x, gump.y)
        return
      }
      if (distance <= 2) {
        this.setSpeed(2)
        return
      }
    }
  }

  setSpeed(speed:number) {
    this.state.speed = speed
  }
  
  setState(state: State) {
    this.state.state = state // state state state statey state
    switch (state) {
      case State.move:
        this.setSpeedBasedOnDestination()
        return
      case State.battle:
        this.setSpeed(0)
        return
    }
  }

  private setSpeedBasedOnDestination() {
    const dist = this.distanceToDestination()
    console.log('dist to dest: ', dist)
    if (dist > 2) {
      this.setSpeed(4)
      return
    }
    if (dist > 0.25) {
      this.setSpeed(2)
      return
    }
    this.setSpeed(0)
  }

  setDestination(x: number, z:number) {
    this.state.destination.assign({
      x,
      z,
    })
    this.setSpeedBasedOnDestination()
  }

  private distanceToDestination() {
    return new Vec2(this.state.position.x, this.state.position.z).distance(new Vec2(this.state.destination.x, this.state.destination.z))
  }

}

export default Deer;
