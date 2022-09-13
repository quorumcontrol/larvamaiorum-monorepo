import { DelphsTable } from "../../contracts/typechain"
import { delphsContract, playerContract } from "./contracts"
import Grid from '../boardLogic/Grid'
import Warrior from "../boardLogic/Warrior"

class BoardRunner {
  delphs:DelphsTable
  tableId: string
  grid?: Grid

  private didRun = false

  constructor(tableId:string) {
    this.delphs = delphsContract()
    this.tableId = tableId
  }

  async run() {
    const [table, latest, playerIds] = await Promise.all([
      this.delphs.tables(this.tableId),
      this.delphs.latestRoll(),
      this.delphs.players(this.tableId),
    ])

    const warriors = await Promise.all(playerIds.map(async (id) => {
      const player = playerContract()
      const [stats, name] = await Promise.all([
        this.delphs.statsForPlayer(this.tableId, id),
        player.name(id),
      ])
      return new Warrior({
        id: id,
        name: name,
        attack: stats.attack.toNumber(),
        defense: stats.defense.toNumber(),
        initialHealth: stats.health.toNumber(),
      })
    }))

    const started = table.startedAt
    const ended = started.add(table.gameLength)

    if (!latest.gte(ended)) {
      throw new Error('table not over yet')
    }

    const rolls = await Promise.all(new Array(table.gameLength.add(1).toNumber()).fill(true).map(async (_, i) => {
      const rollToGet = started.add(i)
      const [roll,destinations] = await Promise.all([
        this.delphs.rolls(rollToGet),
        this.delphs.destinationsForRoll(this.tableId, rollToGet.sub(1)),
      ])
      return {
        tick: rollToGet,
        random: roll,
        destinations,
      }
    }))

    const grid = new Grid({
      warriors,
      seed: rolls[0].random,
      sizeX: table.tableSize,
      sizeY: table.tableSize,
      wootgumpMultipler: table.wootgumpMultiplier,
      gameLength: table.gameLength.toNumber(),
    })

    grid.start(rolls[0].random)

    rolls.forEach((roll, i) => {
      if (i === 0) {
        return // skip the first one which is just setup
      }
      roll.destinations.forEach((d) => {
        grid.warriors.find((w) => w.id.toLowerCase() === d.player.toLowerCase())?.setDestination(d.x.toNumber(), d.y.toNumber())
      })
      grid.handleTick(roll.random)
    })

    this.didRun = true
    this.grid = grid

    return grid
  }

  rewards() {
    if (!this.didRun || !this.grid) {
      throw new Error("Didn't run the grid yet")
    }

    return this.grid.rewards()
  }
}

export default BoardRunner
