import { randomUUID } from 'crypto'
import { Vec2 } from "playcanvas";
import { DelphsTableState, Deer as DeerState, Warrior as WarriorState, Vec2 as StateVec2, Battle, State, DeerAttack } from "../rooms/schema/DelphsTableState";
import BattleLogic from './BattleLogic';
import Deer from './Deer';
import DeerAttackLogic from './DeerAttackLogic';
import { randomBounded, randomInt } from "./utils/randoms";
import Warrior, { WarriorStats } from "./Warrior";

type BattleList = Record<string, BattleLogic> // guid to an existing battle

class DelphsTableLogic {
  state: DelphsTableState

  intervalHandle?:any

  warriors: Record<string, Warrior>
  wootgump: Record<string, Vec2>
  trees: Record<string, Vec2>
  deer: Record<string, Deer>
  battles: BattleList
  deerAttacks: Record<string, DeerAttackLogic>

  // for now assume a blank table at construction
  // TODO: handle a populated state with existing warriors, etc
  constructor(state:DelphsTableState) {
    this.state = state
    this.warriors = {}
    this.wootgump = {}
    this.trees = {}
    this.battles = {}
    this.deer = {}
    this.deerAttacks = {}
  }

  start() {
    let previous = new Date()
    this.update(0)
    this.intervalHandle = setInterval(() => {
      const diff = (new Date().getTime()) - previous.getTime()
      previous = new Date()
      this.update(diff/1000)
    }, 100)
    for (let i = 0; i < 10; i++) {
      this.spawnOneGump(this.randomPosition())
    }
    for (let i = 0; i < 80; i++) {
      const position = this.randomPosition()
      this.spawnTree(new Vec2(position.x, position.z))
    }
    for (let i = 0; i < 10; i++) {
      const position = this.randomPosition()
      this.spawnDeer(new Vec2(position.x, position.z))
    }
  }

  stop() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle)
    }
  }

  update(dt:number) {
    Object.values(this.warriors).forEach((w) => {
      w.update(dt)
    })
    Object.values(this.deer).forEach((d) => {
      d.update(dt)
    })
    this.spawnGump()
    this.checkForHarvest()
    this.handleBattles(dt)
    this.handleDeerAttacks(dt)
  }

  addWarrior(sessionId:string, stats:WarriorStats) {
    console.log('add warrior', stats)
    const position = this.randomPosition()
    const state = new WarriorState({
      ...stats,
      id: sessionId,
      speed: 0,
      wootgumpBalance: stats.initialGump,
      currentHealth: stats.initialHealth
    })
    console.log("state: ", state.toJSON())
    state.position.assign(position)
    state.destination.assign(position)
    this.warriors[sessionId] = new Warrior(state)
    this.state.warriors.set(sessionId, state)
  }

  removeWarrior(sessionId:string) {
    delete this.warriors[sessionId]
    this.state.warriors.delete(sessionId)
  }

  updateDestination(sessionId:string, {x, z}: {x:number,z:number}) {
    this.warriors[sessionId].setDestination(x, z)
  }

  spawnOneGump(position: {x:number, z:number}) {
    const id = randomUUID()
    this.wootgump[id] = new Vec2(position.x, position.z)
    this.state.wootgump.set(id, new StateVec2().assign(position))
  }

  checkForHarvest() {
    // let the deer feed first
    Object.values(this.deer).forEach((deer) => {
      Object.keys(this.wootgump).forEach((gumpId) => {
        if (deer.position.distance(this.wootgump[gumpId]) < 0.7) {
          delete this.wootgump[gumpId]
          this.state.wootgump.delete(gumpId)
        }
      })
    })

    Object.values(this.warriors).forEach((w) => {
      Object.keys(this.wootgump).forEach((gumpId) => {
        if (w.position.distance(this.wootgump[gumpId]) < 0.7) {
          w.incGumpBalance(1)
          delete this.wootgump[gumpId]
          this.state.wootgump.delete(gumpId)
        }
      })
    })
  }

  handleBattles(dt: number) {
    const pairs:[Warrior, Warrior][] = []

    const warriors = Object.values(this.warriors)

    warriors.forEach((w) => {
      if (this.battles[w.id]) {
        return
      }
      // otherwise find warriors we should battle
      warriors.forEach((potentialOpponent) => {
        if (potentialOpponent.id === w.id) {
          return
        }
        if (w.position.distance(potentialOpponent.position) < 1) {
          pairs.push([w, potentialOpponent])
        }
      })
    })

    pairs.forEach((pair) => {
      if (pair.some((w) => this.battles[w.id])) {
        return // if any pair is already in battle, then skip
      }
      const id = randomUUID()
      const state = new Battle({
        id
      })
      state.warriorIds.push(...pair.map((p) => p.id))
      // otherwise setup a battle
      const battle = new BattleLogic(id, pair, state)
      pair.forEach((w) => {
        this.battles[w.id] = battle
      })
      this.state.battles.set(id, battle.state)
    })

    // start them all
    new Set(Object.values(this.battles)).forEach((battle) => {
      battle.update(dt) // update first so that new battles that are not started can ignore the time
      battle.go()
      if (battle.completed) {
        console.log('battle complete')
        battle.warriors.forEach((w) => {
          delete this.battles[w.id]
        })
        this.state.battles.delete(battle.id)
      }
    })
  }

  handleDeerAttacks(dt:number) {
    const eligibleDeer = Object.values(this.deer).filter((d) => [State.move, State.chasing].includes(d.state.state))
    const eligibleWarriors = Object.values(this.warriors).filter((w) => w.state.state === State.move)
    eligibleDeer.forEach((deer) => {
      eligibleWarriors.forEach((w) => {
        // skip over already assigned warriors
        if (w.state.state !== State.move) {
          return
        }
        if (deer.position.distance(w.position) <= 0.6) {
          console.log('deer close, setting up attack')
          const id = randomUUID()
          const attackState = new DeerAttack({
            id,
            warriorId: w.id,
            deerId: deer.id 
          })
          this.state.deerAttacks.set(id, attackState)
          const attack = new DeerAttackLogic(id, deer, w)
          this.deerAttacks[id] = attack
          attack.go()
        }
      })
    })

    Object.values(this.deerAttacks).forEach((attack) => {
      attack.update(dt)
      if (attack.complete) {
        this.state.deerAttacks.delete(attack.id)
        delete this.deerAttacks[attack.id]
      }
    })
  }

  private spawnGump() {
    const allGumps = Object.values(this.wootgump)
    if (allGumps.length >= 100) {
      return
    }
    allGumps.forEach((gump, i) => {
      if (randomInt(100) <= 5) {
        const xDiff = randomBounded(6)
        const zDiff = randomBounded(6)
        const x = this.positionModulo(gump.x + xDiff)
        const z = this.positionModulo(gump.y + zDiff)
        this.spawnOneGump({x, z })
      }
    })
    // now let's see if we get a new area too
    if (randomInt(100) <= 10) {
      this.spawnOneGump(this.randomPosition())
    }
  }

  private positionModulo(dimension: number) {
    if (dimension < 0 && dimension < 37) {
      return 36
    }
    if (dimension > 37) {
      return dimension % 35
    }
    return dimension
  }

  private spawnTree(position:Vec2) {
    const id = randomUUID()
    this.trees[id] = position
    this.state.trees.set(id, new StateVec2().assign({x: position.x, z: position.y}))
  }

  private spawnDeer(position:Vec2) {
    const id = randomUUID()
    const deerState = new DeerState()
    deerState.position.assign({
      x: position.x,
      z: position.y
    })
    const deer = new Deer(deerState, this.wootgump, this.warriors)
    this.deer[id] = deer
    this.state.deer.set(id, deerState)
  }

  randomPosition() {
    return {
      x: randomBounded(37),
      z: randomBounded(37),
    }
  }


}

export default DelphsTableLogic
