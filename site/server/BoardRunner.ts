import { DelphsTable } from "../contracts/typechain"
import { delphsContract, playerContract } from "../src/utils/contracts"
import Grid from '../src/boardLogic/Grid'
import Warrior from "../src/boardLogic/Warrior"


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

    const rolls = await Promise.all(new Array(table.gameLength.toNumber()).fill(true).map(async (_, i) => {
      const [roll,destinations] = await Promise.all([
        this.delphs.rolls(started.add(i)),
        this.delphs.destinationsForRoll(this.tableId, started.add(i - 1)),
      ])
      return {
        tick: started.add(i),
        random: roll,
        destinations,
      }
    }))

    const grid = new Grid({
      warriors,
      seed: rolls[0].random,
      sizeX: 10,
      sizeY: 10,
      gameLength: table.gameLength.toNumber(),
    })

    grid.start(rolls[0].random)

    rolls.forEach((roll) => {
      roll.destinations.forEach((d) => {
        grid.warriors.find((w) => w.id.toLowerCase() === d.player.toLowerCase())?.setDestination(d.x.toNumber(), d.y.toNumber())
      })
      grid.handleTick(roll.random)
    })

    this.didRun = true
    this.grid = grid

    return grid
  }

  gumpOutput() {
    if (!this.didRun || !this.grid) {
      throw new Error("Didn't run the grid yet")
    }

    return this.grid.warriors.reduce((memo, warrior) => {
      return {
        ...memo,
        [warrior.id]: warrior.wootgumpBalance,
      }
    }, {})
  }


}


export default BoardRunner