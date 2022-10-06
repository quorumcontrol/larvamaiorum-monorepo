import { DelphsTable } from "../../contracts/typechain"
import { delphsContract, playerContract } from "./contracts"
import Grid from '../boardLogic/Grid'
import Warrior from "../boardLogic/Warrior"
import { utils } from "ethers"
import { defaultInitialInventory } from "../boardLogic/items"

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
    const [table, latest, playerIds, initialGump] = await Promise.all([
      this.delphs.tables(this.tableId),
      this.delphs.latestRoll(),
      this.delphs.players(this.tableId),
      this.delphs.initialGump(this.tableId),
    ])

    const player = playerContract()

    const warriors = await Promise.all(playerIds.map(async (id, i) => {
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
        initialGump: Math.floor(parseFloat(utils.formatEther(initialGump[i]))),
        initialInventory: defaultInitialInventory,
      })
    }))

    const started = table.startedAt
    const ended = started.add(table.gameLength)

    if (!latest.gte(ended)) {
      throw new Error('table not over yet')
    }

    const rolls = await Promise.all(new Array(table.gameLength.toNumber() + 1).fill(true).map(async (_, i) => {
      console.log('getting roll: ', started.add(i).toNumber())
      const rollToGet = started.add(i)
      const [roll, destinations, items] = await Promise.all([
        this.delphs.rolls(rollToGet),
        this.delphs.destinationsForRoll(this.tableId, rollToGet.sub(1)),
        this.delphs.itemPlaysForRoll(this.tableId, rollToGet.sub(1)),
      ])
      return {
        tick: rollToGet,
        random: roll,
        destinations,
        items,
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
      roll.items.forEach((itemPlay) => {
        grid.warriors.find((w) => w.id.toLowerCase() === itemPlay.player.toLowerCase())?.setItem({ address: itemPlay.itemContract, id: itemPlay.id.toNumber() })
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
