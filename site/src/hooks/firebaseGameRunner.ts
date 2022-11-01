import { useQuery, useQueryClient } from "react-query"
import { DelphsTable } from "../../contracts/typechain"
import { delphsContract, playerContract } from "../utils/contracts"
import mqttClient, { ROLLS_CHANNEL, NO_MORE_MOVES_CHANNEL } from '../utils/mqtt'
import ThenArg from "../utils/ThenArg"
import SingletonQueue from "../utils/singletonQueue"
import { BigNumber, BigNumberish, utils } from "ethers"
import { memoize } from "../utils/memoize"
import { EventEmitter } from "events"
import { useEffect, useState } from "react"
import Grid, { DestinationSettings, ItemPlays } from "../boardLogic/Grid"
import Warrior, { WarriorState, WarriorStats } from "../boardLogic/Warrior"
import { defaultInitialInventory, InventoryItem } from "../boardLogic/items"
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from "../utils/firebase"

const MISSING_PING_TIMEOUT = 30 * 1000 // 30 seconds

const log = console.log //debug('gameRunner')
interface IFrameRoll {
  index: number,
  random: string,
  destinations: { id: string, x: number, y: number }[]
  items: { player: string, item: InventoryItem }[]
}

function bigNumMin(a: BigNumber, b: BigNumber) {
  if (a.lte(b)) {
    return a
  }
  return b
}

interface BoardSetup {
  currentPlayer: string
  seed:string
  tableSize: number
  gameLength: number
  warriors?: WarriorState[]
}

export class GameRunner extends EventEmitter {
  tableId: string
  iframe: HTMLIFrameElement

  private started = false

  latest = BigNumber.from(0)

  over = false

  singleton: SingletonQueue

  player: string

  private tableInfo?: ThenArg<ReturnType<DelphsTable['tables']>>
  private players?: ThenArg<ReturnType<DelphsTable['players']>>
  private initialGump?: ThenArg<ReturnType<DelphsTable['initialGump']>>
  private autoPlay?: ThenArg<ReturnType<DelphsTable['autoPlay']>>

  private checkForMissingTimeout?: ReturnType<typeof setTimeout>

  grid?: Grid
  rolls: IFrameRoll[]

  constructor(tableId: string, player:string, iframe: HTMLIFrameElement) {
    super()
    log('--------------- new firebase game runnner')
    this.singleton = new SingletonQueue(`game-runner-${tableId}`)
    this.tableId = tableId
    this.iframe = iframe
    this.player = player
    this.rolls = [] // this gets expanded out in setup
  }

  async setup() {
    const docRef = doc(db, `/tables/${this.tableId}`)
    const unsub = onSnapshot(docRef, (doc) => {
      
    })

    log('------------ firebase game runner setup')
    // mqttClient().on('message', this.handleMqttMessage)
    const delphs = delphsContract()

    const [table, latest, players, initialGump, autoPlay] = await Promise.all([
      delphs.tables(this.tableId),
      delphs.latestRoll(),
      delphs.players(this.tableId),
      delphs.initialGump(this.tableId),
      delphs.autoPlay(this.tableId),
    ]);
    this.tableInfo = table
    this.players = players
    this.initialGump = initialGump
    this.autoPlay = autoPlay
    this.rolls = new Array(table.gameLength.toNumber())

    if (this.shouldStart(latest)) {
      this.singleton.push(() => this.go(latest))
    }

    return this
  }

  stop() {
    mqttClient().removeListener('message', this.handleMqttMessage)
  }

  private shouldStart(tick: BigNumberish) {
    if (!this.tableInfo) {
      return false
    }
    return this.tableInfo.startedAt.gt(0) && BigNumber.from(tick).gte(this.tableInfo.startedAt)
  }

  private async refetchTableInfo() {
    const delphs = delphsContract()

    this.tableInfo = await delphs.tables(this.tableId)
  }

  private checkForEnd() {
    if (!this.tableInfo) {
      throw new Error('no table')
    }
    if (this.grid?.isOver()) {
      this.clearMissingTimer()
      log('game over', this.tableInfo.startedAt.toNumber(), this.tableInfo.gameLength.toNumber(), this.latest.toNumber())
      this.over = true
      this.emit('END')
      this.stop()
      return
    }
    log('not over: current', this.latest.toNumber(), ' end: ', this.tableInfo.startedAt.add(this.tableInfo.gameLength).toNumber())
    log('grid over? ', this.grid?.isOver(), this.grid?.tick)
  }

  private async go(latest: BigNumber) {
    if (this.started) {
      console.error('tried to double start')
      return
    }
    log('----------- setting gameRunner.started to true')
    this.started = true

    log('table info: ', this.tableInfo)

    if (!this.players || !this.tableInfo) {
      throw new Error('missing players or tableInfo')
    }
    const player = playerContract()
    const delphs = delphsContract()

    const initialStats = await Promise.all(
      (this.players || []).map(async (addr, i) => {
        const [name, stats] = await Promise.all([
          player.name(addr),
          delphs.statsForPlayer(this.tableId, addr)
        ])
        return {
          name,
          initialGump: Math.floor(parseFloat(utils.formatEther(this.initialGump![i]))),
          stats,
          autoPlay: this.autoPlay![i]
        }
      })
    );
    log("names", initialStats);

    const warriors: WarriorStats[] = (this.players || []).map((p, i) => {
      const { name, initialGump, stats, autoPlay } = initialStats[i]
      return {
        id: p,
        name: name,
        attack: stats.attack.toNumber(),
        defense: stats.defense.toNumber(),
        initialHealth: stats.health.toNumber(),
        initialGump: initialGump,
        initialInventory: defaultInitialInventory,
        autoPlay,
      }
    })

    const firstRoll = await this.getRoll(this.tableInfo.startedAt.toNumber())
    this.grid = new Grid({
      warriors: warriors.map((ws) => new Warrior(ws)),
      seed: firstRoll.random,
      sizeX: this.tableInfo.tableSize,
      sizeY: this.tableInfo.tableSize,
      wootgumpMultipler: this.tableInfo.wootgumpMultiplier,
      gameLength: this.tableInfo.gameLength.toNumber(),
    })
    this.grid.start(firstRoll.random)
    this.rolls[0] = firstRoll
    log('gameRunner first roll', firstRoll)
    
    const msg:BoardSetup = {
      currentPlayer: this.player,
      seed: firstRoll.random,
      tableSize: this.tableInfo.tableSize,
      gameLength: this.tableInfo.gameLength.toNumber(),
      warriors: this.grid.rankedWarriors().map((w) => w.toWarriorState()),
    }
    log('shipping setup', this.tableInfo.startedAt.toNumber(), latest.toNumber(), this.tableInfo.gameLength.toNumber())
    this.ship('setupBoard', msg)
    this.latest = BigNumber.from(firstRoll.index)
    if (latest.gt(this.tableInfo.startedAt)) {
      this.catchUp(this.tableInfo.startedAt.add(1), bigNumMin(latest, this.tableInfo.startedAt.add(this.tableInfo.gameLength)).add(1))
    }
  }

  private clearMissingTimer() {
    if (this.checkForMissingTimeout) {
      clearTimeout(this.checkForMissingTimeout)
      this.checkForMissingTimeout = undefined
    }
  }

  private clearAndSetupMissingTimer() {
    this.clearMissingTimer()
    if (!this.grid?.isOver()) {
      this.checkForMissingTimeout = setTimeout(() => {
        this.checkForMissing()
      }, MISSING_PING_TIMEOUT)
    }
  }

  private async checkForMissing() {
    this.singleton.push(async () => {
      log('checking for missing')
      const delphs = delphsContract()
      if (!this.tableInfo) {
        console.error('checking for missing, but there is no table info')
        return
      }
  
      const latestRoll = await delphs.latestRoll()
      const lastRoll = this.tableInfo.startedAt.add(this.tableInfo.gameLength).add(1)
      if (latestRoll.gt(this.latest) && !this.grid?.isOver() && this.latest.lt(lastRoll)) {
        log('there were missing rolls, catching up')
        return this.catchUp(this.tableInfo.startedAt.add(1), bigNumMin(latestRoll, lastRoll))
      }
    })
  }

  private async catchUp(start: BigNumber, end: BigNumber) {
    log("catching up", start.toString(), end.toString());
    const missing = await Promise.all(
      Array(end.sub(start).toNumber())
        .fill(true)
        .map((_, i) => {
          return this.getRoll(start.add(i).toNumber());
        })
    );
    log("missing: ", missing);
    missing.forEach((roll) => {
      this.shipRoll(roll)
    });
  }

  private handleMqttMessage(topic: string, msg: Buffer) {
    log('game runner mqtt handler: ', topic, msg.toString())
    switch (topic) {
      case ROLLS_CHANNEL: {
        const parsedMsg = JSON.parse(msg.toString());
        this.handleOrchestratorRoll(parsedMsg)
        this.clearAndSetupMissingTimer()
      }
      case NO_MORE_MOVES_CHANNEL:
        const { tick } = JSON.parse(msg.toString());
        this.handleNoMoreMoves(tick)
        break;
      default:
        log("mqtt unknown topic: ", topic);
    }
  }

  // this needs to be async so it can be easily put into the singleton
  private async handleNoMoreMoves(tick:number) {
    this.singleton.push(async () => {
      if (!this.latest.add(1).eq(tick)) {
        log("this is not a no more moves for the next tick, it is", tick, "when we are at ", this.latest.toNumber())
        return
      }
      return this.ship('noMoreMoves', { tick });
    })
  }

  private shipRoll(roll: IFrameRoll) {
    // TODO: check if this is the right roll to ship
    const rollIndex = BigNumber.from(roll.index).sub(this.tableInfo!.startedAt).toNumber()
    if (this.rolls[rollIndex]) {
      console.error('we already shipped this roll')
      this.checkForEnd()
      return
    }
    if (!this.latest.add(1).eq(BigNumber.from(roll.index))) {
      console.error('expected', this.latest.add(1).toNumber(), 'but got', roll.index)
      this.checkForEnd()
      return
    }
    this.rolls[rollIndex] = roll
    log("rolls: ", this.rolls)
    const tickReport = this.updateGrid(roll)
    log("ship: ", tickReport)
    this.latest = BigNumber.from(roll.index)
    this.ship('tick', tickReport)
    this.checkForEnd()
  }

  private updateGrid(roll: IFrameRoll) {
    if (!this.grid) {
      throw new Error('missing grid')
    }
    if (!this.grid.isOver()) {
      const destinations = roll.destinations.reduce((memo, destination) => {
        return {
          ...memo,
          [destination.id]: {x: destination.x, y: destination.y}
        }
      }, {} as DestinationSettings)

      const itemPlays = roll.items.reduce((memo, play) => {
        return {
          ...memo,
          [play.player]: play.item
        }
      }, {} as ItemPlays)

      return this.grid.handleTick(roll.random, destinations, itemPlays)
    }
  }

  ship(msgType: string, msg: any) {
    this.iframe.contentWindow?.postMessage(
      JSON.stringify({
        type: msgType,
        data: {
          ...msg,
        }
      }),
      "*"
    );
  }

  private async getRoll(index: number): Promise<IFrameRoll> {
    log('getting roll: ', index)
    const delphs = delphsContract()
    const [random, destinations, itemPlays] = await Promise.all([
      delphs.rolls(index),
      delphs.destinationsForRoll(this.tableId, index - 1),
      delphs.itemPlaysForRoll(this.tableId, index - 1),
    ])

    return {
      index,
      random,
      destinations: this.destinationsToIframe(destinations),
      items: this.itemPlaysToIframe(itemPlays),
    }
  }

  private async handleTick({ tick, random }: { tick: number, random: string }) {
    log('handling tick', tick)
    if (!this.started) {
      log('not started, refetching')
      await this.refetchTableInfo()
      if (!this.shouldStart(tick)) {
        return
      }
      await this.go(this.tableInfo!.startedAt)
    }

    if (this.latest.gte(tick)) {
      console.error('received tick but we are already past')
      return
    }

    // latest is 1, roll comes in for 3, then start == 2 and end == 3
    if (BigNumber.from(tick).gt(this.latest.add(1))) {
      await this.catchUp(this.latest.add(1), BigNumber.from(tick))
    }

    const delphs = delphsContract()
    const [destinations, itemPlays] = await Promise.all([
      delphs.destinationsForRoll(this.tableId, tick - 1),
      delphs.itemPlaysForRoll(this.tableId, tick - 1),
    ])
    log('shipping tick ', tick)
    const roll = {
      index: tick,
      random,
      destinations: this.destinationsToIframe(destinations),
      items: this.itemPlaysToIframe(itemPlays),
    }
    this.shipRoll(roll)
  }

  private async handleOrchestratorRoll({ tick, random }: { txHash?: string, tick: number, random: string, blockNumber?: number }) {
    log('mqtt tick incoming: ', tick)
    this.singleton.push(async () => {
      if (BigNumber.from(tick).lte(this.latest)) {
        console.error("do not know, but tick is less than latest")
        return
      }
      return this.handleTick({ tick, random })
    })
  }

  private destinationsToIframe(destinations: ThenArg<ReturnType<DelphsTable['destinationsForRoll']>>): IFrameRoll['destinations'] {
    return destinations.map((d) => {
      return {
        id: d.player,
        x: d.x.toNumber(),
        y: d.y.toNumber(),
      }
    })
  }

  private itemPlaysToIframe(itemPlays: ThenArg<ReturnType<DelphsTable['itemPlaysForRoll']>>): IFrameRoll['items'] {
    return itemPlays.map((itemPlay) => {
      return {
        player: itemPlay.player,
        item: {
          address: itemPlay.itemContract,
          id: itemPlay.id.toNumber(),
        }
      }
    })
  }
}

const getGameRunnerFor = memoize((tableId: string, address:string, iframe?: HTMLIFrameElement) => {
  return new GameRunner(tableId!, address, iframe!).setup()
})

const useGameRunner = (tableId?: string, player?: string, iframe?: HTMLIFrameElement, ready?: boolean) => {
  const queryClient = useQueryClient()

  const query = useQuery(['/game-runner', tableId], async () => {
    log("----------------------- useQuery refetched")
    return getGameRunnerFor(tableId!, player!, iframe!)
  }, {
    enabled: !!tableId && !!iframe && !!player && ready,
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
  const [over, setOver] = useState(query.data ? query.data.over : false)

  useEffect(() => {
    if (!query.data) {
      return
    }
    const handler = () => {
      setTimeout(() => {
        queryClient.invalidateQueries(["/wootgump-balance", player])
        queryClient.refetchQueries(["/wootgump-balance", player])
        queryClient.invalidateQueries(["/delphs-gump-balance", player])
        queryClient.refetchQueries(["/delphs-gump-balance", player])
      }, 5000)

      setOver(true)
    }
    query.data.on('END', handler)
    return () => {
      query.data.removeListener('END', handler)
    }
  }, [setOver, query.data, player, queryClient])

  return { ...query, over }
}

export default useGameRunner
