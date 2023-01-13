import { randomInt } from "./utils/randoms";
import { BehavioralState, Deer as DeerState, DelphsTableState, GameNags } from '../rooms/schema/DelphsTableState'
import { Vec2 } from "playcanvas";
import Warrior from "./Warrior";
import vec2ToVec2 from "./utils/vec2ToVec2";
import LocomotionLogic from "./LocomotionLogic";

type TrapHolder = DelphsTableState['traps']

class Deer {
  id: string;
  state: DeerState

  gumps: Record<string,Vec2>
  warriors: Record<string, Warrior>
  traps: TrapHolder

  chasing?: Warrior
  lastChased?: Warrior

  locomotion: LocomotionLogic

  constructor(state:DeerState, wootgumps: Record<string, Vec2>, warriors: Record<string, Warrior>, traps: TrapHolder ) {
    this.id = state.id
    this.state = state
    this.gumps = wootgumps
    this.warriors = warriors
    this.traps = traps
    this.locomotion = new LocomotionLogic(this.state.locomotion)
    // const gump = Object.values(wootgumps)[randomInt(Object.values(wootgumps).length - 1)]
  }

  update(dt:number) {
    this.locomotion.update(dt)
    if ([BehavioralState.move, BehavioralState.chasing].includes(this.state.behavioralState) && this.locomotion.speed() > 0) {
      this.updateDestination()
    }
  }

  updateDestination() {
    // if we're chasing, get distracted by gump.
    if (this.state.behavioralState === BehavioralState.chasing) {
      const gump = this.nearbyGump() || this.randomGump()
      
      // if we're not chasing or the warrior we're chasing died or started to fight, or if we're scared of a trap
      // then just go after another gump.
      if (!this.chasing || this.chasing.state.behavioralState !== BehavioralState.move || this.isNearbyTrap()) {
        this.stopChasing()
        if (gump) {
          this.setDestination(gump.x, gump.y)
        }
        return
      }

      // if the player has played a card while chasing, then start ignoring them.
      if (this.chasing!.state.currentItem?.repels.includes(GameNags.deer)) {
        this.stopChasing()
        if (gump) {
          this.setDestination(gump.x, gump.y)
        }
      }

      if (gump && randomInt(1000) < 10) {
        console.log('stopping chasing to go after gump')
        this.stopChasing()
        this.setDestination(gump.x, gump.y)
        return
      }
      
      // otherwise set the destination of the warrior
      if (this.chasing) {
        const position = this.chasing.locomotion.position
        this.setDestination(position.x, position.y)
        return
      }
 
    }
    // if we're going after a gump, go after warriors that smell good
    const nearbyWarrior = this.nearbyLoadedUpWarrior()
    if (nearbyWarrior && nearbyWarrior !== this.lastChased && randomInt(100) < 5) {
      console.log('nearby warrior: ', nearbyWarrior.state.name)
      nearbyWarrior.sendMessage("Reindeer is after you.")
      this.chasing = nearbyWarrior
      this.setDestination(nearbyWarrior.locomotion.position.x, nearbyWarrior.locomotion.position.y)
      this.setState(BehavioralState.chasing)
      return
    }
    // otherwise let's just go where we're going until we get there
    const distance = this.locomotion.distanceToDestination()

    if (distance <= 0.5) {
      this.lastChased = undefined
      const gump = this.nearbyGump() || this.randomGump()
      if (gump) {
        this.setDestination(gump.x, gump.y)
      }
    }
  }

  chase(warrior:Warrior) {
    this.chasing = warrior
    this.setDestination(warrior.locomotion.position.x, warrior.locomotion.position.y)
    this.setState(BehavioralState.chasing)
  }

  private stopChasing() {
    this.setState(BehavioralState.move)
    this.lastChased = this.chasing
    this.chasing = undefined
  }

  private randomGump():Vec2|undefined {
    return Object.values(this.gumps)[randomInt(Object.values(this.gumps).length)]
  }

  private isNearbyTrap():boolean {
    for (const [_id, trap] of this.traps.entries()) {
      if (vec2ToVec2(trap.position).distance(this.locomotion.position) < 2) {
       return true
      }
    }

    return false
  }

  private nearbyGump():Vec2|undefined {
    const eligible = Object.values(this.gumps).filter((gump) => {
      return this.locomotion.position.distance(gump) < 5
    })
    return eligible[randomInt(eligible.length)]
  }

  private nearbyLoadedUpWarrior():Warrior|undefined {
    return Object.values(this.warriors).find((warrior) => {
      return warrior.state.wootgumpBalance > 10 &&
        this.locomotion.position.distance(warrior.locomotion.position) < 6 &&
          !warrior.state.currentItem
    })
  }

  setState(state: BehavioralState) {
    this.state.behavioralState = state // state state state statey state
    switch (state) {
      case BehavioralState.move:
        this.locomotion.unfreeze()
        return
      case BehavioralState.chasing:
        return
      case BehavioralState.dead:
        this.locomotion.freeze()
        return
    }
  }

  setDestination(x: number, z:number) {
    this.locomotion.setDestination(x,z)
  }

}

export default Deer;
