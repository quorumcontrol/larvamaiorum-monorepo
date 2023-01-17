import { Vec2 } from "playcanvas"
import { RovingAreaAttack, BehavioralState } from "../rooms/schema/DelphsTableState"
import randomPosition from "./utils/randomPosition"
import { randomBounded } from "./utils/randoms"
import Warrior from "./Warrior"

const DEFAULT_TIME_IN_ONE_PLACE = 10
const RADIUS = 5.8

class RovingAreaAttackLogic {
  timeSinceMove = 0
  state: RovingAreaAttack
  position: Vec2

  timeInOnePlace = DEFAULT_TIME_IN_ONE_PLACE

  warriors: Record<string,Warrior>

  timeSinceHealthWithdrawl = 0

  constructor(state:RovingAreaAttack, warriors:Record<string,Warrior>) {
    this.state = state
    this.warriors = warriors
    this.updatePlace()
  }

  update(dt:number) {
    this.timeSinceMove += dt
    this.timeSinceHealthWithdrawl += dt
    if (this.timeSinceMove >= this.timeInOnePlace) {
      this.updatePlace()
      this.timeSinceMove = 0
    }
    if (this.timeSinceHealthWithdrawl > 0.7) {
      this.findCloseWarriorsAndHurtThem()
      this.timeSinceHealthWithdrawl = 0
    }
  }

  updatePlace() {
    const {x,z} = randomPosition()
    this.position = new Vec2(x,z)
    this.state.position.assign({ x, z })
    this.timeInOnePlace = DEFAULT_TIME_IN_ONE_PLACE + randomBounded(0.5)
  }

  findCloseWarriorsAndHurtThem() {
    Object.values(this.warriors).forEach((w) => {
      if (w.locomotion.position.distance(this.position) <= RADIUS) {
        if ([BehavioralState.move, BehavioralState.battle].includes(w.state.behavioralState)) {
          w.sendMessage("This area is cursed.")
          const currentHealth = w.getHealth()
          w.setHealth(currentHealth - (currentHealth * 0.15))
        }
      }
    })
  }

}

export default RovingAreaAttackLogic