import EventEmitter from "events";
import { deterministicRandom, randomInt } from "./utils/randoms";
import { State, Deer as DeerState } from '../rooms/schema/DelphsTableState'
import { Vec2 } from "playcanvas";
import Warrior from "./Warrior";

class Deer extends EventEmitter {
  id: string;
  state: DeerState

  gumps: Record<string,Vec2>
  warriors: Record<string, Warrior>

  chasing?: Warrior
  lastChased?: Warrior

  position:Vec2
  destination:Vec2

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
    if ([State.move, State.chasing].includes(this.state.state) && this.state.speed > 0) {
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
      this.updateDestination()
    }
  }

  updateDestination() {
    // if we're chasing, get distracted by gump.
    if (this.state.state === State.chasing) {
      const gump = this.nearbyGump()
      if (gump && randomInt(1000) < 5) {
        console.log('stopping chasing to go after gump')
        this.stopChasing()
        this.setDestination(gump.x, gump.y)
        return
      }

      if (this.chasing!.state.state !== State.move) {
        this.stopChasing()
        const gump = this.nearbyGump() || this.randomGump()
        if (gump) {
          this.setDestination(gump.x, gump.y)
        }
        return
      }
      
      // otherwise set the destination of the warrior
      const position = this.chasing!.position
      console.log('distance to warrior: ', this.chasing.position.distance(position))
      this.setDestination(position.x, position.y)
      return
    }
    // if we're going after a gump, go after warriors that smell good
    const nearbyWarrior = this.nearbyLoadedUpWarrior()
    if (nearbyWarrior && nearbyWarrior !== this.lastChased && randomInt(100) < 20) {
      console.log('nearby warrior: ', nearbyWarrior.state.name)
      this.chasing = nearbyWarrior
      this.setDestination(nearbyWarrior.position.x, nearbyWarrior.position.y)
      this.setState(State.chasing)
      return
    }
    // otherwise let's just go where we're going until we get there
    const distance = this.position.distance(this.destination)

    if (distance <= 0.5) {
      this.lastChased = undefined
      const gump = this.nearbyGump() || this.randomGump()
      if (gump) {
        this.setDestination(gump.x, gump.y)
      }
    }
  }

  private stopChasing() {
    this.setState(State.move)
    this.lastChased = this.chasing
    this.chasing = undefined
  }

  private randomGump():Vec2|undefined {
    return Object.values(this.gumps)[randomInt(Object.values(this.gumps).length)]
  }

  private nearbyGump():Vec2|undefined {
    const eligible = Object.values(this.gumps).filter((gump) => {
      return this.position.distance(gump) < 5
    })
    return eligible[randomInt(eligible.length)]
  }

  private nearbyLoadedUpWarrior():Warrior|undefined {
    return Object.values(this.warriors).find((warrior) => {
      return warrior.state.wootgumpBalance > 10 && this.position.distance(warrior.position) < 6
    })
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
      case State.chasing:
        this.setSpeedBasedOnDestination()
        return
      case State.battle:
        this.setSpeed(0)
        return
      case State.deerAttack:
        this.setSpeed(0)
        return
    }
  }

  private setSpeedBasedOnDestination() {
    const dist = this.distanceToDestination()
    if (this.state.state === State.chasing && dist > 0.5) {
      this.setSpeed(4.25)
      return
    }
    if (dist > 2) {
      this.setSpeed(4)
      return
    }
    if (dist > 0.25) {
      this.setSpeed(1)
      return
    }
    this.setSpeed(0)
  }

  setDestination(x: number, z:number) {
    this.state.destination.assign({
      x,
      z,
    })
    this.destination = new Vec2(x, z)
    this.setSpeedBasedOnDestination()
  }

  private distanceToDestination() {
    return new Vec2(this.state.position.x, this.state.position.z).distance(new Vec2(this.state.destination.x, this.state.destination.z))
  }

}

export default Deer;
