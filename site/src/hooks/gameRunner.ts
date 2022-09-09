import { useQuery } from "react-query"
import { DelphsTable } from "../../contracts/typechain"
import { delphsContract, playerContract } from "../utils/contracts"
import mqttClient, { ROLLS_CHANNEL, NO_MORE_MOVES_CHANNEL } from '../utils/mqtt'
import ThenArg from "../utils/ThenArg"
import SingletonQueue from "../utils/singletonQueue"
import { BigNumber, BigNumberish } from "ethers"
import { memoize } from "../utils/memoize"
import { EventEmitter } from "events"
import { useEffect, useState } from "react"
import { subscribeOnce } from "./useMqttMessages"

const log = console.log //debug('gameRunner')

interface WarriorStats {
  id: string;
  name: string;
  attack: number;
  defense: number;
  initialHealth: number;
}

interface IFrameRoll {
  index: number,
  random: string,
  destinations: { id: string, x: number, y: number }[]
}

function bigNumMin(a: BigNumber, b: BigNumber) {
  if (a.lte(b)) {
    return a
  }
  return b
}

interface SetupMessage {
  tableId: string,
  warriors: WarriorStats[],
  gameLength: number,
  firstRoll: IFrameRoll,
  wootgumpMultipler: number,
  tableSize: number, 
}

class GameRunner extends EventEmitter {
  tableId: string
  iframe: HTMLIFrameElement

  private started = false

  latest = BigNumber.from(0)

  over = false

  singleton: SingletonQueue

  private tableInfo?: ThenArg<ReturnType<DelphsTable['tables']>>
  private players?: ThenArg<ReturnType<DelphsTable['players']>>

  constructor(tableId: string, iframe: HTMLIFrameElement) {
    super()
    subscribeOnce()
    this.handleMqttMessage = this.handleMqttMessage.bind(this)
    log('--------------- new game runnner')
    this.singleton = new SingletonQueue(`game-runner-${tableId}`)
    this.tableId = tableId
    this.iframe = iframe
  }

  async setup() {
    mqttClient().on('message', this.handleMqttMessage)
    const delphs = delphsContract()

    const [table, latest, players] = await Promise.all([
      delphs.tables(this.tableId),
      delphs.latestRoll(),
      delphs.players(this.tableId)
    ]);
    this.tableInfo = table
    this.players = players
    if (this.shouldStart(latest)) {
      this.singleton.push(() => this.go(latest))
    }
    return this
  }

  stop() {
    mqttClient().removeListener('message', this.handleMqttMessage)
  }

  private shouldStart(tick:BigNumberish) {
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
    if (this.latest.gte(this.tableInfo.startedAt.add(this.tableInfo.gameLength).sub(1))) {
      console.log('game over', this.tableInfo.startedAt.toNumber(), this.tableInfo.gameLength.toNumber(), this.latest.toNumber())
      this.over = true
      this.emit('END')
      return
    }
    console.log('not over: ', this.tableInfo.startedAt.add(this.tableInfo.gameLength).toNumber(), this.latest.toNumber())
  }

  private async go(latest: BigNumber) {
    if (this.started) {
      console.error('tried to double start')
      return
    }
    log('setting this.started to true')
    this.started = true

    log('table info: ', this.tableInfo)

    if (!this.players || !this.tableInfo) {
      throw new Error('missing players or tableInfo')
    }
    const player = playerContract()
    const delphs = delphsContract()

    const names = await Promise.all(
      (this.players || []).map(async (addr) => {
        return player.name(addr);
      })
    );
    log("names", names);

    const warriors: WarriorStats[] = await Promise.all((this.players || []).map(async (p, i) => {
      const name = names[i];
      if (!name) {
        throw new Error("weirdness, non matching lengths");
      }
      const stats = await delphs.statsForPlayer(this.tableId, p)
      return {
        id: p,
        name: name,
        attack: stats.attack.toNumber(),
        defense: stats.defense.toNumber(),
        initialHealth: stats.health.toNumber(),
      }
    }))

    const firstRoll = await this.getRoll(this.tableInfo.startedAt.toNumber())
    log('gameRunner first roll', firstRoll)
    const msg: SetupMessage = {
      tableId: this.tableId,
      firstRoll,
      warriors,
      gameLength: this.tableInfo.gameLength.toNumber(),
      tableSize: this.tableInfo.tableSize,
      wootgumpMultipler: this.tableInfo.wootgumpMultiplier,
    }
    log('shipping setup')
    this.ship('setup', { setup: msg })
    this.latest = BigNumber.from(firstRoll.index)
    if (latest.gt(this.tableInfo.startedAt)) {
      this.catchUp(this.tableInfo.startedAt.add(1), bigNumMin(latest, this.tableInfo.startedAt.add(this.tableInfo.gameLength)))
    }
  }

  private async catchUp(start: BigNumber, end: BigNumber) {
    log("catching up", start.toString(), end.toString());
    const missing = await Promise.all(
      Array(end.sub(start).toNumber() + 1)
        .fill(true)
        .map((_, i) => {
          return this.getRoll(start.add(i).toNumber());
        })
    );
    log("missing: ", missing);
    missing.forEach((roll) => {
      this.ship('orchestratorRoll', { roll: roll })
    });
    this.latest = end
    this.checkForEnd()
  }

  private handleMqttMessage(topic: string, msg: Buffer) {
    log('game runner mqtt handler: ', topic, msg.toString())
    switch (topic) {
      case ROLLS_CHANNEL: {
        const parsedMsg = JSON.parse(msg.toString());
        this.singleton.push(() => this.handleOrchestratorRoll(parsedMsg))
      }
      case NO_MORE_MOVES_CHANNEL:
        const { tick } = JSON.parse(msg.toString());
        this.ship('noMoreMoves', { tick });
        break;
        // return iframe.current?.contentWindow?.postMessage(
        //   JSON.stringify({
        //     type: "noMoreMoves",
        //     tick,
        //   }),
        //   "*"
        // );
      default:
        log("mqtt unknown topic: ", topic);
    }
  }

  private ship(msgType: string, msg: any) {
    this.iframe.contentWindow?.postMessage(
      JSON.stringify({
        type: msgType,
        ...msg,
      }),
      "*"
    );
  }

  private async getRoll(index: number): Promise<IFrameRoll> {
    log('getting roll: ', index)
    const delphs = delphsContract()
    const [random, destinations] = await Promise.all([
      delphs.rolls(index),
      delphs.destinationsForRoll(this.tableId, index - 1)
    ])

    return {
      index,
      random,
      destinations: this.destinationsToIframe(destinations)
    }
  }

  private async handleTick({ tick, random }:{ tick:number, random:string }) {
    log('handling tick', tick)
    if (!this.started) {
      log('not started, refetching')
      await this.refetchTableInfo()
      if (!this.shouldStart(tick)) {
        return
      }
      await this.go(this.tableInfo!.startedAt)
    }

    if (BigNumber.from(tick).gt(this.latest.add(1))) {
      await this.catchUp(this.latest.add(1), BigNumber.from(tick))
    }

    const delphs = delphsContract()
    const destinations = await delphs.destinationsForRoll(this.tableId, tick - 1)
    log('shipping tick ', tick)
    this.ship('orchestratorRoll', {
      roll: {
        index: tick,
        random,
        destinations: this.destinationsToIframe(destinations)
      }
    })
    this.latest = BigNumber.from(tick)
    this.checkForEnd()
  }

  private async handleOrchestratorRoll({ tick, random }: { txHash?: string, tick: number, random: string, blockNumber?: number }) {
    log('mqtt tick incoming: ', tick)
    if (BigNumber.from(tick).lte(this.latest)) {
      console.error("do not know, but tick is less than latest")
      return
    }

    this.singleton.push(() => {
      return this.handleTick({ tick, random })
    })
  }

  private destinationsToIframe(destinations: ThenArg<ReturnType<DelphsTable['destinationsForRoll']>>) {
    return destinations.map((d) => {
      return {
        id: d.player,
        x: d.x.toNumber(),
        y: d.y.toNumber(),
      }
    })
  }
}

const getGameRunnerFor = memoize((tableId:string, iframe?: HTMLIFrameElement) => {
  return new GameRunner(tableId!, iframe!).setup()
})

const useGameRunner = (tableId?: string, iframe?: HTMLIFrameElement, ready?: boolean) => {
  const query = useQuery(['/game-runner', tableId], async () => {
    log("----------------------- useQuery refetched")
    return getGameRunnerFor(tableId!, iframe!)
  }, {
    enabled: !!tableId && !!iframe && ready,
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
  const [over,setOver] = useState(query.data ? query.data.over : false)

  useEffect(() => {
    if (!query.data) {
      return
    }
    const handler = () => {
      setOver(true)
    }
    query.data.on('END', handler)
    return () => {
      query.data.removeListener('END', handler)
    }
  }, [setOver, query.data])

  return {...query, over }
}

export default useGameRunner
