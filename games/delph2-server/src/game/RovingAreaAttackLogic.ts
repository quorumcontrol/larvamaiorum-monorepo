import { Vec2 } from "playcanvas"
import { RovingAreaAttack, State } from "../rooms/schema/DelphsTableState"
import randomPosition from "./utils/randomPosition"
import { randomBounded } from "./utils/randoms"
import Warrior from "./Warrior"

const DEFAULT_TIME_IN_ONE_PLACE = 4
const RADIUS = 6

class RovingAreaAttackLogic {
  timeSinceMove = 0
  state: RovingAreaAttack
  position: Vec2

  timeInOnePlace = DEFAULT_TIME_IN_ONE_PLACE

  warriors: Record<string,Warrior>

  constructor(state:RovingAreaAttack, warriors:Record<string,Warrior>) {
    this.state = state
    this.warriors = warriors
    this.updatePlace()
  }

  update(dt:number) {
    this.timeSinceMove += dt
    if (this.timeSinceMove >= this.timeInOnePlace) {
      this.updatePlace()
      this.timeSinceMove = 0
    }
    this.findCloseWarriorsAndKillThem()
  }

  updatePlace() {
    const {x,z} = randomPosition()
    this.position = new Vec2(x,z)
    this.state.position.assign({ x, z })
    this.timeInOnePlace = DEFAULT_TIME_IN_ONE_PLACE + randomBounded(0.5)
  }

  findCloseWarriorsAndKillThem() {
    Object.values(this.warriors).forEach((w) => {
      if (w.position.distance(this.position) <= RADIUS) {
        if (w.state.state === State.move) {
          w.dieForTime(this.timeInOnePlace, "The gods do not favor you.")
        }
      }
    })
  }

}

export default RovingAreaAttackLogic