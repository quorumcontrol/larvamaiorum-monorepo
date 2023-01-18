import { Vec2, Vec3 } from 'playcanvas'
import { Battle, BattlePhase, Item, BehavioralState, LocomotionState, BattleCommands, SwingDirection, BlockDirection } from '../rooms/schema/DelphsTableState'
import { ItemDescription } from './items'
import LocomotionLogic from './LocomotionLogic'
import { randomBounded, randomFloat, randomInt } from './utils/randoms'
import Warrior from './Warrior'

export enum BattlerType {
  deer,
  warrior,
}

export interface Battler {
  id: string
  name: string
  locomotion: LocomotionLogic
  battlerType: BattlerType

  battleCommands: () => BattleCommands
  // state: BehavioralState

  setIsPiggy: (isPiggy:boolean) => any

  getHealth: () => number
  setHealth: (num: number) => any
  currentAttack: () => number
  currentDefense: () => number

  getState: () => BehavioralState
  setState: (state: BehavioralState) => any

  sendMessage: (msg:string) => any

  getGumpBalance: () => number
  incGumpBalance: (num: number)=> any
  dieForTime: (seconds:number, msg?:string)=>any
}

class BattleLogic2 {
  id: string
  state: Battle

  started = false
  battlers: Battler[]
  wootgumpPot = 0

  center: Vec2

  winner?: Battler
  losers: Battler[]
  cardPicks: Record<string, ItemDescription>

  private roundIntensity = 0
  private roundWinner: Battler
  private roundLoser: Battler

  dancing = true
  timeSinceSwing = 0

  constructor(id: string, battlers: Battler[], state: Battle) {
    this.id = id
    this.battlers = battlers
    this.state = state
    this.losers = []
    this.cardPicks = {}
    this.center = battlers.reduce((vec:Vec2, battler) => {
      vec.add(battler.locomotion.position)
      return vec
    }, new Vec2()).divScalar(battlers.length)

    this.state.center.assign({
      x: this.center.x,
      z: this.center.y,
    })
    this.battlers.forEach((b) => {
      b.locomotion.setLimiter(b.locomotion.walkSpeed())
    })
  }

  update(dt: number) {
    if (!this.started || this.state.phase == BattlePhase.completed) {
      return
    }
    this.handleSwingOrHit(dt)
  }

  private handleSwingOrHit(dt: number) {
    this.timeSinceSwing += dt

    // they are swinging at each other so just let them do that
    if (!this.dancing && this.timeSinceSwing < 1.25) {
      return
    }

    // they should be done swinging, back to dancing
    if (!this.dancing) {
      this.dancing = true
      this.timeSinceSwing = 0
      this.clearBattleCommands()
      this.handleRoundResults()
    }

    const warriorLength = this.battlers.length
    this.battlers.forEach((b, i) => {
      const opponent = this.battlers[(i + 1) % warriorLength]

      b.locomotion.setFocus(opponent.locomotion.position.x, opponent.locomotion.position.y)

      // if another battler set us into battle mode then just quickly skip this.
      if (!this.dancing) {
        return
      }      

      // see if they are close enough to battle
      const distanceToOpponent = b.locomotion.frontPoint.distance(opponent.locomotion.frontPoint)
     
      // if they are just right, then fght!
      if (distanceToOpponent > 1 && distanceToOpponent <= 2) {
        // battle!
        if (this.timeSinceSwing > 1.25) {
          this.commenceHitting()
          return
        }
      }

      // otherwise, keep dancing around each other
      if (b.locomotion.getState() === LocomotionState.arrived) {
        const dest = this.timeSinceSwing > 4 ? this.center : this.randomBattlePosition(opponent.locomotion.destination || this.center)
        b.locomotion.setDestination(dest.x, dest.y)
      }
    })
  }

  private handleRoundResults() {
    if (this.roundIntensity > 0) {
      this.roundLoser.sendMessage(`lost ${this.roundIntensity} health.`)
      this.roundLoser.setHealth(this.roundLoser.getHealth() - this.roundIntensity)
      this.roundWinner.sendMessage(`landed a hit for ${this.roundIntensity} health`)
      // if no one won yet, keep going
      if (this.roundLoser.getHealth() > 0) {
        return
      }

      this.battlers.forEach((warrior, i) => {
        warrior.locomotion.clearLimiter()
        if (warrior === this.roundWinner) {
          warrior.sendMessage("Winner!")
          warrior.setState(BehavioralState.move)
          this.winner = warrior
          return
        }
        if (warrior === this.roundLoser) {
          this.losers.push(warrior)
          const gumpTaken = Math.floor(warrior.getGumpBalance() * 0.5)
          warrior.incGumpBalance(gumpTaken * -1)
          this.battlers[(i + 1) % this.battlers.length].incGumpBalance(gumpTaken)
          console.log("warrior dead from battle")
          warrior.dieForTime(6.5, "You lose.")
          return
        }
        throw new Error("unknown state where round winner/loser as undetermined")
      })
      this.setPhase(BattlePhase.completed)
      this.clearBattleCommands()
    }

  }

  private commenceHitting() {
    console.log("commence hitting")
    this.dancing = false
    this.timeSinceSwing = 0

    const attackerIdx = randomFloat() >= 0.5 ? 0 : 1
    const attacker = this.battlers[attackerIdx]
    const defender = this.battlers[(attackerIdx + 1) % this.battlers.length]
    const attackRoll = randomInt(attacker.currentAttack())
    const defenseRoll = randomInt(defender.currentDefense())

    const intensity = (attackRoll - defenseRoll)

    attacker.locomotion.setDestination(attacker.locomotion.position.x, attacker.locomotion.position.y)
    defender.locomotion.setDestination(defender.locomotion.position.x, defender.locomotion.position.y)

    attacker.battleCommands().assign({
      swingDirection: SwingDirection.middle,
      blockDirection: BlockDirection.none,
      impactStrength: 0
    })

    defender.battleCommands().assign({
      swingDirection: SwingDirection.none,
      blockDirection: BlockDirection.middle,
      impactStrength: Math.abs(intensity), // show an animation even if it's a block
    })

    this.roundWinner = intensity >= 0 ? attacker : defender
    this.roundLoser = intensity >= 0 ? defender : attacker
    this.roundIntensity = intensity
  }

  private clearBattleCommands() {
    this.battlers.forEach((b) => {
      b.battleCommands().assign({
        impactStrength: 0,
        swingDirection: SwingDirection.none,
        blockDirection: BlockDirection.none,
      })
    })
  }

  setCardPick(warrior: Warrior, card: ItemDescription) {
    //nothing
  }

  setPhase(phase: BattlePhase) {
    console.log("battle set phase: ", phase)
    this.state.assign({ phase })
  }

  isPhase(phase: BattlePhase) {
    return this.state.phase === phase
  }
  
  // give a random point that is far enough away from another point
  // often we will give the opponents keeping distance so that the players do not overlaps
  private randomBattlePosition(keepingDistanceFrom?: Vec2) {
    if (!this.center) {
      throw new Error("missing center on get random position")
    }

    const randX = randomBounded(2)
    const randY = randomBounded(2)

    let rand = new Vec2(randX, randY)

    while (rand.distance(keepingDistanceFrom) < 0.4) {
      const randX = randomBounded(2)
      const randY = randomBounded(2)
      rand = new Vec2(randX, randY)
    }

    return this.center.clone().add(rand)
  }

  go() {
    if (this.started) {
      return
    }
    console.log('battle started')
    this.started = true

    this.battlers.forEach((b) => {
      b.setState(BehavioralState.battle)

      const rand = this.randomBattlePosition(this.center)
      b.locomotion.setDestination(rand.x, rand.y)
      b.locomotion.setFocus(this.center.x, this.center.y)
    })

    this.setPhase(BattlePhase.battling)
  }
}

export default BattleLogic2
