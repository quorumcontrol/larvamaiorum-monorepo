import { State } from "../rooms/schema/DelphsTableState";
import Deer from "./Deer";
import Warrior from "./Warrior";

class DeerAttackLogic {
  id: string
  deer: Deer
  warrior:Warrior

  started = false
  over = false
  complete = false
  clock = 0

  constructor(id: string, deer:Deer, warrior:Warrior) {
    this.id = id
    this.deer = deer
    this.warrior = warrior
  }

  go() {
    if (this.started) {
      return
    }
    this.started = true
    this.deer.setState(State.deerAttack)
    this.warrior.setState(State.deerAttack)
  }

  update(dt:number) {
    if (!this.started || this.complete) {
      return
    }
    this.clock += dt
    // 3 seconds later, let the player run free but take 25% of their gump
    if (this.clock > 3 && !this.over) {
      this.over = true
      this.warrior.setState(State.move)
      this.warrior.incGumpBalance(-1 * Math.floor(this.warrior.state.wootgumpBalance * 0.25))
      return
    }
    
    // let the deer graze for 4 seconds before chasing the player again
    if (this.clock > 7 && !this.complete) {
      this.complete = true
      this.deer.setState(State.move)
    } 
  }

}

export default DeerAttackLogic