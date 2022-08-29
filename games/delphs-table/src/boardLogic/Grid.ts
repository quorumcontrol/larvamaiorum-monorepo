
import Cell, { CellOutComeDescriptor } from './Cell'
import { deterministicRandom, fakeRandomSeed } from './random'
import Warrior from './Warrior'
import debug from 'debug'
import {  BytesLike } from 'ethers'

const log = debug('Grid')

export interface TickOutput {
  tick: number
  seed: string
  outcomes: CellOutComeDescriptor[][]
}

interface GridOptions {
  warriors: Warrior[]
  seed:string
  sizeX: number
  sizeY: number
  gameLength: number,
  wootgumpMultipler: number,
}

class Grid {
  id:string

  sizeX: number
  sizeY: number
  chanceOfSpawningWootGumpIn1000: number
  currentSeed:string

  warriors: Warrior[]

  tick = 0
  gameLength:number

  // 2x2 array of locations
  grid:Cell[][] = []

  started = false
  
  constructor(opts:GridOptions) {
    this.gameLength = opts.gameLength
    this.currentSeed = opts.seed
    this.id = `grid-${this.currentSeed}`
    this.sizeX = opts.sizeX
    this.sizeY = opts.sizeY
    this.warriors = opts.warriors
    this.chanceOfSpawningWootGumpIn1000 = opts.wootgumpMultipler
    for (let y = 0; y < this.sizeY; y++) {
      for (let x = 0; x < this.sizeX; x++) {
        this.grid[x] = this.grid[x] || []
        this.grid[x][y] = new Cell({x, y, grid: this})
      }
    }
  }

  doDevTick() {
    log(`------ tick: ${this.tick} seed: ${this.currentSeed} ------`)

    this.everyCell((cell) => {
      cell.handleOutcomes(this.tick, this.currentSeed)
    })

    this.everyCell((cell) => {
      cell.doMovement(this.tick, this.currentSeed)
    })

    // then update which tick we are at
    this.newRandomSeed()
    this.tick++
    
    return { tick: this.tick, seed: this.currentSeed }
  }

  start(seed:BytesLike) {
    this.currentSeed = seed.toString()
    this.initialCellPopulation(this.warriors)
    this.started = true
  }

  handleTick(randomness:BytesLike):TickOutput {
    if (this.isOver()) {
      throw new Error('ticking when already over')
    }
    this.currentSeed = randomness.toString()
    let outcomes:CellOutComeDescriptor[][] = []
    if (this.tick !== 0) {
      this.everyCell((cell) => {
        cell.doMovement(this.tick, this.currentSeed)
      })
    }
    this.everyCell((cell) => {
      outcomes[cell.x] ||= []
      outcomes[cell.x][cell.y] = cell.handleOutcomes(this.tick, this.currentSeed)
    })

    this.tick++;
    return { tick: this.tick, seed: this.currentSeed, outcomes }
  }

  isOver() {
    return this.tick >= this.gameLength
  }

  private newRandomSeed() {
    this.currentSeed = fakeRandomSeed()
    return this.currentSeed
  }

  everyCell(func:(cell:Cell)=>any) {
    for (let y = 0; y < this.sizeY; y++) {
      for (let x = 0; x < this.sizeX; x++) {
        func(this.grid[x][y])
      }
    }
  }

  private initialCellPopulation(warriors:Warrior[]) {
    log('initial cellpopulation: ', this.sizeX, this.sizeY)
    this.warriors = warriors
    warriors.forEach((warrior) => {
      this.grid[deterministicRandom(this.sizeX, `grid-${warrior.id}-x`, this.currentSeed)][deterministicRandom(this.sizeY, `grid-${warrior.id}-y`, this.currentSeed)].addWarrior(warrior)
    })
  }

}

export default Grid
