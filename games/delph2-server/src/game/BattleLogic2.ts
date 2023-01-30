import { Vec2 } from 'playcanvas'
import { Battle, BattlePhase, BehavioralState, LocomotionState, BattleCommands, SwingDirection, BlockDirection, Vec2 as StateVec2, Item } from '../rooms/schema/DelphsTableState'
import { ItemDescription } from './items'
import LocomotionLogic from './LocomotionLogic'
import { randomBounded, randomFloat, randomInt } from './utils/randoms'

const SLIDER_BONUS = 0.20 // 20% can be determined by your slider
const REGIONAL_BONUS_PERCENTAGE = 20

// this is the maximum normalized distance. in code: new pc.Vec2(-1,-1).distance(new pc.Vec2(1,1))
const MAX_REGIONAL_DIFFERENCE = 2.8284271247461903

export enum BattlerType {
  deer,
  warrior,
}

export interface Battler {
  id: string
  name: string
  locomotion: LocomotionLogic
  battlerType: BattlerType

  randomizeBattleRegion?: boolean
  ignoreNonKeyHolder?: boolean

  currentItem: () => ItemDescription|undefined

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

interface ControlState {
  attackDefenseSlider: number // between -100 and 100
  regionalPosition: Vec2 // normalized region, the distance between the two points adjusts the battle
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
  private roundWinner?: Battler
  private roundLoser?: Battler

  private controls: Record<string, ControlState>

  private sampledControls: Record<string, ControlState>

  dancing = true
  timeSinceSwing = 0

  private timeSinceShownControls = 0

  constructor(id: string, battlers: Battler[], state: Battle) {
    this.id = id
    this.battlers = battlers
    this.state = state
    this.losers = []
    this.cardPicks = {}
    this.controls = battlers.reduce((memo, b) => {
      return {
        ...memo,
        [b.id]: {
          attackDefenseSlider: 0,
          regionalPosition: new Vec2(0,0),
        }
      }
    }, {} as Record<string, ControlState>)
    this.sampledControls = this.sampleControls()
    this.updateStateForSampledControls()

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

  interruptAndTerminate() {
    this.setPhase(BattlePhase.completed)

    this.battlers.forEach((b) => {
      b.setState(BehavioralState.move)
    })
  }

  setControls(battlerId: string, controls:ControlState) {
    if (!this.battlers.find((b) => b.id === battlerId)) {
      throw new Error("battle received a control message when there was no battler")
    }
    this.controls[battlerId] = controls
  }

  update(dt: number) {
    if (!this.started || this.state.phase == BattlePhase.completed) {
      return
    }
    this.handleSwingOrHit(dt)
    this.possiblyUpdateControls(dt)
  }

  private updateStateForSampledControls() {
    Object.keys(this.sampledControls).forEach((battlerId) => {
      const sampledPosition = this.sampledControls[battlerId].regionalPosition
      const regionalPosition = new StateVec2()
      regionalPosition.assign({
        x: sampledPosition.x,
        z: sampledPosition.y,
      })
      this.state.approximateRegionControls.set(battlerId, regionalPosition)
    })
  }

  // every 2 seconds, show the players what the positions were (2 seconds *ago*)
  private possiblyUpdateControls(dt:number) {
    this.timeSinceShownControls += dt
    if (this.timeSinceShownControls >= 1) {
      console.log(this.id, "updating sampled controls")
      this.updateStateForSampledControls()
      this.sampledControls = this.sampleControls()
      this.battlers.forEach((b) => {
        console.log(this.id, b.id, "randomizedBattleRegion?", b.randomizeBattleRegion)
        if (b.randomizeBattleRegion) {
          const region = this.randomRegion()
          console.log("updating region for", b.id, region)
          this.controls[b.id].regionalPosition = region
        }
      })
      this.timeSinceShownControls = 0
    }
  }

  private sampleControls() {
    return Object.keys(this.controls).reduce((memo, battlerId) => {
      return {
        ...memo,
        [battlerId]: {
          attackDefenseSlider: this.controls[battlerId].attackDefenseSlider,
          regionalPosition: this.controls[battlerId].regionalPosition.clone(),
        }
      }
    }, {} as Record<string, ControlState>)
  }

  private randomRegion() {
    return new Vec2(randomBounded(1), randomBounded(1))
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

  private randomAttackerAndDefender() {
    const attackerIdx = randomFloat() >= 0.5 ? 0 : 1
    const attacker = this.battlers[attackerIdx]
    const defender = this.battlers[(attackerIdx + 1) % this.battlers.length]
    return { attacker, defender }
  }

  private getAttackerAndDefender() {
    if (!this.roundWinner) {
      return this.randomAttackerAndDefender()
    }

    // 2/3 chance we keep the same attacker so they can go on a streak
    if (randomInt(3) > 0) {
      return { attacker: this.roundWinner, defender: this.roundLoser }
    }

    // but if not, do the random one again
    return this.randomAttackerAndDefender()
  }

  private getAttackRoll(attacker: Battler) {
    const controls = this.controls[attacker.id]
    const rawRoll = randomInt(Math.floor(attacker.currentAttack()))

    console.log("attack multiplier: ",  1+(SLIDER_BONUS * controls.attackDefenseSlider / 100))
    // a full slider to attack gives you +20% but a full to defense gives you -20%
    const multiplier = 1 + (SLIDER_BONUS * controls.attackDefenseSlider / 100)
    return rawRoll * multiplier
  }

  private getDefenseRoll(defender: Battler) {
    const controls = this.controls[defender.id]
    const rawRoll = randomInt(Math.floor(defender.currentDefense()))

    console.log("defense multiplier: ", 1-(SLIDER_BONUS * controls.attackDefenseSlider / 100))
    // a full slider to defense gives you +20% but a full to attack gives you -20%
    const multiplier = 1 - (SLIDER_BONUS * controls.attackDefenseSlider / 100)
    return rawRoll * multiplier
  }

  private controlBonus(attacker: Battler, defender: Battler) {
    const defenseControls = this.controls[defender.id]
    const attackControls = this.controls[attacker.id]

    const distance = attackControls.regionalPosition.distance(defenseControls.regionalPosition)

    // take the distance and we scale that to a zero to the double the max regional difference then later
    // we are going to subtract the number so that a zero distance becomes a negative bonus and a larger distance becomes a positive bonus
    const scaleTo0toDoubleBonusPercentage = (distance * (REGIONAL_BONUS_PERCENTAGE * 2)) / MAX_REGIONAL_DIFFERENCE

    return (scaleTo0toDoubleBonusPercentage - REGIONAL_BONUS_PERCENTAGE) / 100
  }

  private commenceHitting() {
    console.log("commence hitting")
    this.dancing = false
    this.timeSinceSwing = 0

    const { attacker, defender } = this.getAttackerAndDefender()
    
    console.log("control bonus: ", this.controlBonus(attacker, defender))

    const attackRoll = Math.floor(this.getAttackRoll(attacker) * (1 + this.controlBonus(attacker, defender)))
    const defenseRoll = Math.floor(this.getDefenseRoll(defender))

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
