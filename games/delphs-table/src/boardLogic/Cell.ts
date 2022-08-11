import Grid from "./Grid"
import { deterministicRandom } from "./random"
import Warrior from "./Warrior"
import Wootgump from './Wootgump'
import debug from 'debug'
import Battle, { BattleTickReport } from "./Battle"

const log = debug('Cell')

// warriorID is the index in these next two types
type HarvestReport = {[index: string]: Wootgump[]}
type RejuvanizeReport = {[index: string]: number}

export interface CellOutComeDescriptor {
  incoming: Warrior[]
  outgoing: Warrior[]
  spawned: Wootgump[]
  harvested: HarvestReport
  battleTicks: BattleTickReport[]
  rejuvanized: RejuvanizeReport
}

interface CellInitializeOptions {
  x:number
  y:number
  grid:Grid
}

class Cell {
  warriors:Warrior[]
  outgoing:Warrior[]
  incoming:Warrior[]

  battles:Battle[]
  wootgump:Wootgump[]

  grid:Grid
  x:number
  y:number

  constructor(opts:CellInitializeOptions) {
    this.grid = opts.grid
    this.x = opts.x
    this.y = opts.y
    this.warriors = []
    this.outgoing = []
    this.incoming = []
    this.battles = []
    this.wootgump = []
  }

  get id() {
    return `cell-${this.x}-${this.y}`
  }

  addWarrior(warrior:Warrior) {
    this.warriors.push(warrior)
    warrior.setLocation(this)
  }

  handleOutcomes(tick:number, seed:string):CellOutComeDescriptor {
    const descriptor:CellOutComeDescriptor = {
      incoming: this.incoming,
      outgoing: this.outgoing,
      spawned: [],
      harvested: {},
      battleTicks: [],
      rejuvanized: {},
    }

    this.warriors = this.warriors.filter((w) => {
      return !this.outgoing.includes(w)
    })
    this.outgoing = []
    this.incoming.forEach((warrior) => {
      this.addWarrior(warrior)
    })
    this.incoming = []

    const gumpSpawned = this.maybeSpawnWootgump(tick, seed)
    if (gumpSpawned) {
      descriptor.spawned.push(gumpSpawned)
    }
    this.maybeSetupBattle(tick, seed)
    if (this.battles.length > 0) {
     this.battles.forEach((b) => {
       descriptor.battleTicks.push(b.doBattleTick(tick, seed))
     })
     this.battles.filter((b) => b.isOver()).forEach((battle) => {
      battle.warriors.forEach((w) => {
        w.emit('battleOver', battle)
      })
     })
     this.battles = this.battles.filter((b) => !b.isOver())
    } else {
      descriptor.rejuvanized = this.rejuvanize()
    }
    descriptor.harvested = this.harvest()

    return descriptor
  }

  doMovement(_tick: number, _seed:string) {
    const movers = this.nonBattlingWarriors()
    movers.forEach((warrior) => {
      if (!warrior.destination || this.hasWarriorArrived(warrior)) {
        warrior.setRandomDestination(this.grid)
      }
      const newCell = this.grid.grid[this.x + this.deltaX(warrior.destination![0])][this.y + this.deltaY(warrior.destination![1])]
      this.outgoing.push(warrior)
      this.log(`${warrior.name} moves to ${newCell.x} ${newCell.y}`)
      newCell.incoming.push(warrior)
    })
  }

  private deltaX(x:number) {
    if (x == this.x) {
      return 0
    }
    if (x > this.x) {
      return 1
    }
    return -1
  }

  private deltaY(y:number) {
    if (y == this.y) {
      return 0
    }
    if (y > this.y) {
      return 1
    }
    return -1
  }

  private hasWarriorArrived(warrior:Warrior) {
    if (!warrior.destination) {
      return false
    }
    return warrior.destination[0] == this.x && warrior.destination[1] == this.y
  }

  private harvest():HarvestReport {
    const harvesters = this.nonBattlingWarriors()
    if (harvesters.length == 0) {
      return {}
    }
    let i = 0
    const harvestReport:HarvestReport = {}
    while (this.wootgump.length > 0) {
      const wootgump = this.wootgump.pop()
      if (!wootgump) {
        throw new Error('no wootgump found')
      }
      const harvestor = harvesters[i % harvesters.length]
      harvestReport[harvestor.id] = harvestReport[harvestor.id] || []
      harvestReport[harvestor.id].push(wootgump)
      harvestor.wootgumpBalance += 1
      i++
    }
    return harvestReport
  }

  private maybeSetupBattle(tick: number, seed: string) {
    const nonBattling = this.nonBattlingWarriors()
    if (nonBattling.length >= 2) {
      const warriors = nonBattling.slice(0,2)
      const battle = new Battle({warriors, startingTick: tick, seed: seed})
      this.battles.push(battle)
      warriors.forEach((w) => w.emit('battle', battle))
    }
  }

  nonBattlingWarriors() {
    const inBattle = this.battlingWarriors()
    return this.warriors.filter((w) => {
      return !inBattle.includes(w) && w.currentHealth > 0
    })
  }

  deadWarriors() {
    const inBattle = this.battlingWarriors()
    return this.warriors.filter((w) => {
      return !inBattle.includes(w) && w.currentHealth <= 0
    })
  }

  private battlingWarriors() {
    return this.battles.map((b) => b.warriors).flat()
  }

  private livingWarriors() {
    return this.warriors.filter((w) => w.isAlive())
  }

  private rejuvanize() {
    if (this.livingWarriors().length > 0) {
      this.log('rejuvanizing')
    }
    // if there isn't a battle going on then the wootgump can restore the health of warriors
    // TODO: we can make this way more complicated if we want with nearby wootgump, etc... for now it's 20%
    return this.warriors.reduce((healthIncreases, w) => {
      healthIncreases[w.id] = w.recover(0.20)
      return healthIncreases
    }, {} as RejuvanizeReport)
  }

  private chanceOfSpawningWootgump() {
    let multiplier = 1
    if (this.wootgump.length > 0) {
      multiplier += 35
    }
    if (this.anyNearbyCellHasWootgump()) {
     multiplier += 10
    }
    return this.grid.chanceOfSpawningWootGumpIn1000 * multiplier
  }

  private anyNearbyCellHasWootgump() {
    for (let xDelta = -1; xDelta <= 1; xDelta++) {
      for (let yDelta = -1; yDelta <= 1; yDelta++) {
        if (xDelta === 0 && yDelta === 0) {
          continue; // skip *this* cell and only look at surrounding
        }
        const row = this.grid.grid[this.x + xDelta]
        if (!row) {
          continue;
        }
        const cell = row[this.y + yDelta]
        if (!cell) {
          continue;
        }
        if (cell.wootgump.length > 0) {
          return true
        }
      }
    }
    return false
  }

  private maybeSpawnWootgump(tick:number, seed:string) {
    const wootGumpRoll = this.rand(1000, tick, seed)
    if (wootGumpRoll <= this.chanceOfSpawningWootgump()) {
      this.log('adding wootgump')
      const wootgump = new Wootgump()
      this.wootgump.push(wootgump)
      return wootgump
    }
    return null
  }

  private rand(max: number, tick:number, seed:string, extraId = '') {
    return deterministicRandom(max, `${this.grid.id}-${this.x}-${this.y}-${tick}${extraId}`, seed)
  }

  private log(...args:any[]) {
    return log(this.x, this.y, ...args)
  }

}

export default Cell
