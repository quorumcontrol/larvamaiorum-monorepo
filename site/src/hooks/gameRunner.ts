import { useQuery } from "react-query"
import { DelphsTable } from "../../contracts/typechain"
import { delphsContract, playerContract } from "../utils/contracts"
import mqttClient, { ROLLS_CHANNEL } from '../utils/mqtt'
import ThenArg from "../utils/ThenArg"
import debug from 'debug'
import SingletonQueue from "../utils/singletonQueue"
import { BigNumber } from "ethers"

const log = debug('gameRunner')

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

interface SetupMessage { tableId: string, warriors: WarriorStats[], gameLength: number, firstRoll: IFrameRoll }


class GameRunner {
  tableId: string
  iframe: HTMLIFrameElement

  private started = false

  latest = BigNumber.from(0)

  singleton: SingletonQueue

  private tableInfo?: ThenArg<ReturnType<DelphsTable['tables']>>
  private players?: ThenArg<ReturnType<DelphsTable['players']>>

  constructor(tableId: string, iframe: HTMLIFrameElement) {
    this.singleton = new SingletonQueue(`game-runner-${tableId}`)
    this.tableId = tableId
    this.iframe = iframe
  }

  async setup() {
    mqttClient().on('message', (topic: string, msg: Buffer) => {
      this.handleMqttMessage(topic, msg)
    })
    const delphs = delphsContract()

    const [table, latest, players] = await Promise.all([
      delphs.tables(this.tableId),
      delphs.latestRoll(),
      delphs.players(this.tableId)
    ]);
    this.tableInfo = table
    this.players = players
    if (latest.gte(table.startedAt)) {
      this.singleton.push(() => this.go(latest))
    }
    return this
  }

  private async go(latest: BigNumber) {
    if (this.started) {
      console.error('tried to double start')
      return
    }
    this.started = true

    console.log('table info: ', this.tableInfo)

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
    const msg: SetupMessage = {
      tableId: this.tableId,
      firstRoll,
      warriors,
      gameLength: this.tableInfo.gameLength.toNumber(),
    }
    this.ship('setup', { setup: msg })
    this.latest = BigNumber.from(firstRoll.index)
    if (latest.gt(this.tableInfo.startedAt)) {
      this.catchUp(this.tableInfo.startedAt.add(1), bigNumMin(latest, this.tableInfo.startedAt.add(this.tableInfo.gameLength)))
    }
  }

  private async catchUp(start: BigNumber, end: BigNumber) {
    log("catching up", start.toString(), end.toString());
    const missing = await Promise.all(
      Array(end.sub(start).add(1).toNumber())
        .fill(true)
        .map((_, i) => {
          return this.getRoll(start.add(i).toNumber());
        })
    );
    // log("missing: ", missing);
    missing.forEach((roll) => {
      this.ship('orchestratorRoll', { roll: roll })
    });
    this.latest = end
  }


  private handleMqttMessage(topic: string, msg: Buffer) {
    console.log('game runner mqtt handler: ', topic, msg.toString())
    switch (topic) {
      case ROLLS_CHANNEL: {
        const parsedMsg = JSON.parse(msg.toString());
        this.singleton.push(() => this.handleOrchestratorRoll(parsedMsg))
      }
      default:
        console.log("mqtt: ", topic);
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
    console.log('getting roll: ', index)
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

  private async handleOrchestratorRoll({ tick, random }: { txHash?: string, tick: number, random: string, blockNumber?: number }) {
    console.log('tick found')
    if (BigNumber.from(tick).gt(this.latest.add(1))) {
      await this.catchUp(this.latest.add(1), BigNumber.from(tick))
    }
    if (BigNumber.from(tick).lte(this.latest)) {
      console.error("do not know, but tick is less than latest")
      return
    }
    const delphs = delphsContract()
    const destinations = await delphs.destinationsForRoll(this.tableId, tick - 1)
    this.ship('orchestratorRoll', {
      roll: {
        index: tick,
        random,
        destinations: this.destinationsToIframe(destinations)
      }
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

const useGameRunner = (tableId?: string, iframe?: HTMLIFrameElement, ready?: boolean) => {
  return useQuery(['/game-runner', tableId], async () => {
    return new GameRunner(tableId!, iframe!).setup()
  }, {
    enabled: !!tableId && !!iframe && ready,
    refetchOnReconnect: false,
    refetchOnMount: false,
  })
}

export default useGameRunner

