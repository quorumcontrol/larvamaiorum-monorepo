import { randomUUID } from 'crypto'
import { Vec2 } from "playcanvas";
import { DelphsTableState, Warrior as WarriorState, Vec2 as StateVec2, Battle } from "../rooms/schema/DelphsTableState";
import BattleLogic from './BattleLogic';
import { randomBounded, randomInt } from "./utils/randoms";
import Warrior, { WarriorStats } from "./Warrior";

type BattleList = Record<string, BattleLogic> // guid to an existing battle

interface BattleLook {
  guid: string
  warrior: Warrior
  position: Vec2
}

class DelphsTableLogic {
  state: DelphsTableState

  intervalHandle?:any

  warriors: Record<string, Warrior>
  wootgump: Record<string, Vec2>
  trees: Record<string, Vec2>
  battles: BattleList

  // for now assume a blank table at construction
  // TODO: handle a populated state with existing warriors, etc
  constructor(state:DelphsTableState) {
    this.state = state
    this.warriors = {}
    this.wootgump = {}
    this.trees = {}
    this.battles = {}
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
    this.spawnGump()
    this.checkForHarvest()
    this.handleBattles(dt)
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

  private spawnGump() {
    const allGumps = Object.values(this.wootgump)
    if (allGumps.length >= 100) {
      return
    }
    allGumps.forEach((gump, i) => {
      if (randomInt(100) <= 5) {
        const xDiff = randomBounded(6)
        const zDiff = randomBounded(6)
        this.spawnOneGump({x: gump.x + xDiff, z: gump.y + zDiff})
      }
    })
    // now let's see if we get a new area too
    if (randomInt(100) <= 10) {
      this.spawnOneGump(this.randomPosition())
    }
  }

  private spawnTree(position:Vec2) {
    const id = randomUUID()
    this.trees[id] = position
    this.state.trees.set(id, new StateVec2().assign({x: position.x, z: position.y}))
  }

  randomPosition() {
    return {
      x: randomBounded(38),
      z: randomBounded(38),
    }
  }


}

export default DelphsTableLogic
