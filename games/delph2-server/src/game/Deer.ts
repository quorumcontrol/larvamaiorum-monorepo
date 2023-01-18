import { randomInt } from "./utils/randoms";
import { BehavioralState, Deer as DeerState, DelphsTableState, GameNags } from '../rooms/schema/DelphsTableState'
import { Vec2 } from "playcanvas";
import Warrior, { randomBattleStats } from "./Warrior";
import vec2ToVec2 from "./utils/vec2ToVec2";
import LocomotionLogic from "./LocomotionLogic";
import { Battler, BattlerType } from "./BattleLogic2";
import randomPosition from "./utils/randomPosition";
import { Room } from "colyseus";

type TrapHolder = DelphsTableState['traps']

class Deer implements Battler {
  id: string;
  battlerType: BattlerType.deer
  name = "A Deer"

  state: DeerState
  

  health:number
  attack:number
  defense:number

  currentHealth = 1000

  gumpBalance = 0

  gumps: Record<string, Vec2>
  warriors: Record<string, Warrior>
  traps: TrapHolder

  chasing?: Warrior
  lastChased?: Warrior

  locomotion: LocomotionLogic

  timeSinceDeath = 0
  deathSentenceTime = 0

  constructor(state: DeerState, wootgumps: Record<string, Vec2>, warriors: Record<string, Warrior>, traps: TrapHolder, debugRoom?:Room) {
    this.id = state.id
    this.state = state
    this.gumps = wootgumps
    this.warriors = warriors
    this.traps = traps
    console.log("deer has debug room:", !!debugRoom)
    this.locomotion = new LocomotionLogic(this.state.locomotion, 1, debugRoom)
    
    const {attack, initialHealth, defense } = randomBattleStats(this.id)
    this.health = initialHealth + randomInt(100)
    this.attack = attack + randomInt(100)
    this.defense = defense + randomInt(100)
  }

  update(dt: number) {
    this.locomotion.update(dt)
    if (this.state.behavioralState === BehavioralState.dead) {
      this.timeSinceDeath += dt
      if (this.timeSinceDeath >= this.deathSentenceTime) {
        this.recoverFromDeath()
      }
    }
    if ([BehavioralState.move, BehavioralState.chasing].includes(this.state.behavioralState)) {
      this.updateDestination()
    }
  }

  currentAttack() { return this.attack }
  currentDefense() { return this.defense }

  setIsPiggy(isPiggy: boolean) {
    return true
  }

  getGumpBalance() {
    return this.gumpBalance
  }

  incGumpBalance(amt:number) {
    this.gumpBalance += amt
  }

  sendMessage(msg:string) {
    console.log("deer got message: ", msg)
  }

  recoverFromDeath() {
    this.timeSinceDeath = 0
    this.deathSentenceTime = 0
    this.currentHealth = this.health
    const { x, z } = randomPosition()
    this.locomotion.setPosition(x, z)
    this.locomotion.setDestination(x, z)
    this.locomotion.unfreeze()
    this.setState(BehavioralState.move)
  }

  dieForTime(seconds: number, message = "you died") {
    this.timeSinceDeath = 0
    this.deathSentenceTime = seconds
    this.locomotion.freeze()
    this.setState(BehavioralState.dead)
    this.sendMessage(message)
  }

  private updateDestination() {
    if (this.state.behavioralState === BehavioralState.battle) {
      return
    }
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

  chase(warrior: Warrior) {
    this.chasing = warrior
    this.setDestination(warrior.locomotion.position.x, warrior.locomotion.position.y)
    this.setState(BehavioralState.chasing)
  }

  private stopChasing() {
    this.setState(BehavioralState.move)
    this.lastChased = this.chasing
    this.chasing = undefined
  }

  private randomGump(): Vec2 | undefined {
    return Object.values(this.gumps)[randomInt(Object.values(this.gumps).length)]
  }

  private isNearbyTrap(): boolean {
    for (const [_id, trap] of this.traps.entries()) {
      if (vec2ToVec2(trap.position).distance(this.locomotion.position) < 2) {
        return true
      }
    }

    return false
  }

  getHealth() {
    return this.health
  }

  setHealth(health: number) {
    this.health = health
  }

  private nearbyGump(): Vec2 | undefined {
    const eligible = Object.values(this.gumps).filter((gump) => {
      return this.locomotion.position.distance(gump) < 5
    })
    return eligible[randomInt(eligible.length)]
  }

  private nearbyLoadedUpWarrior(): Warrior | undefined {
    return Object.values(this.warriors).find((warrior) => {
      if (warrior.getState() !== BehavioralState.move) {
        return false
      }
      return warrior.state.wootgumpBalance > 10 &&
        this.locomotion.position.distance(warrior.locomotion.position) < 6 &&
        !warrior.state.currentItem
    })
  }


  getState() {
    return this.state.behavioralState
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

  battleCommands() {
    return this.state.battleCommands
  }

  setDestination(x: number, z: number) {
    this.locomotion.setDestinationAndFocus(x, z)
  }

}

export default Deer;
