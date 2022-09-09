
import { BigNumber, BigNumberish, ContractReceipt, utils, Wallet } from "ethers";
import debug, { Debugger } from 'debug'
import { keccak256 } from "ethers/lib/utils";
import { faker } from '@faker-js/faker'
import { NonceManager } from '@ethersproject/experimental'
import * as dotenv from "dotenv";
import testnetBots from '../contracts/bots-testnet'
import mainnetBots from '../contracts/bots-mainnet'
import { OrchestratorState__factory, TeamStats__factory } from "../contracts/typechain";
import { addresses, isTestnet } from "../src/utils/networks";
import { accoladesContract, delphsContract, lobbyContract, playerContract, wootgumpContract } from "../src/utils/contracts";
import promiseWaiter from '../src/utils/promiseWaiter'
import SingletonQueue from '../src/utils/singletonQueue'
import { skaleProvider } from "../src/utils/skaleProvider";
import mqttClient, { NO_MORE_MOVES_CHANNEL, ROLLS_CHANNEL } from '../src/utils/mqtt'
import Pinger from "./pinger";
import { DiceRolledEvent } from "../contracts/typechain/DelphsTable";
import BoardRunner from "../src/utils/BoardRunner";

dotenv.config({
  path: '.env.local'
})

const ONE = utils.parseEther('1')

const NUMBER_OF_ROUNDS = 20
const TABLE_SIZE = 7
const WOOTGUMP_MULTIPLIER = 15

const SECONDS_BETWEEN_ROUNDS = 15
const STOP_MOVES_BUFFER = 4 // seconds before the next round to stop moves

if (!process.env.DELPHS_PRIVATE_KEY) {
  console.error('no private key')
  throw new Error("must have a DELPHS private key")
}

function hashString(msg: string) {
  return keccak256(Buffer.from(msg))
}

const botSetup = isTestnet ? testnetBots : mainnetBots

function shuffle(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i

    // swap elements array[i] and array[j]
    // we use "destructuring assignment" syntax to achieve that
    // you'll find more details about that syntax in later chapters
    // same can be written as:
    // let t = array[i]; array[i] = array[j]; array[j] = t
    [array[i], array[j]] = [array[j], array[i]];
  }
}

async function getBots(num: number) {
  const botNames = Object.keys(botSetup)
  shuffle(botNames)
  return botNames.slice(0, num).map((name) => {
    return {
      name,
      ...botSetup[name]
    }
  })
}

const txSingleton = new SingletonQueue()

const provider = skaleProvider

const wallet = new NonceManager(new Wallet(process.env.DELPHS_PRIVATE_KEY).connect(provider))

const lobby = lobbyContract().connect(wallet)
const delphs = delphsContract().connect(wallet)
const player = playerContract().connect(wallet)
const wootgump = wootgumpContract().connect(wallet)
const accolades = accoladesContract().connect(wallet)

const orchestratorState = OrchestratorState__factory.connect(addresses().OrchestratorState, wallet)
const teamStats = TeamStats__factory.connect(addresses().TeamStats, wallet)

class TableMaker {
  log: Debugger

  singleton: SingletonQueue

  constructor() {
    this.log = debug('table-maker')
    this.singleton = new SingletonQueue('table-maker')
  }

  instantLobbyRegistration() {
    this.log('wait over, doing table maker')
    this.singleton.push(async () => {
      try {
        return await this.makeTable()
      } catch (err) {
        console.error('error doing make tables', err)
        process.exit(1)
      }
    })
  }

  async handleLobbyRegistration() {
    this.log('lobby registration, waiting')
    await promiseWaiter(15000)
    this.instantLobbyRegistration()
  }

  private async makeTable() {
    try {
      this.log('make table')

      const waiting = await lobby.waitingAddresses()
      if (waiting.length === 0) {
        this.log('no one is waiting')
        return
      }

      const botNumber = Math.max(10 - waiting.length, 0)
      const id = hashString(`${faker.company.companyName()}: ${faker.company.bs()}}`)

      const playersWithNamesAndSeeds = (await Promise.all(waiting.concat((await getBots(botNumber)).map((b) => b.address)).map(async (address) => {
        const name = await player.name(address)
        if (!name) {
          this.log(`${address} has no name`)
          return null
        }
        return {
          name,
          address
        }
      })))
        .filter((p) => !!p)
        .map((p) => {
          return {
            ...p,
            seed: hashString(`${id}-${player!.name}-${player!.address}`)
          }
        })
      const tx = await txSingleton.push(async () => {
        this.log('doing create and start tx')
        const startTx = await delphs.createAndStart({
          id,
          players: playersWithNamesAndSeeds.map((p) => p.address!),
          seeds: playersWithNamesAndSeeds.map((p) => p.seed),
          gameLength: NUMBER_OF_ROUNDS,
          owner: await wallet.getAddress(),
          startedAt: 0,
          tableSize: TABLE_SIZE,
          wootgumpMultiplier: WOOTGUMP_MULTIPLIER,
        }, { gasLimit: 3_000_000 })
        this.log('doing orchestrator state add')
        await orchestratorState.add(id, { gasLimit: 1000000 })
        this.log('taking addresses')
        await lobby.takeAddresses(waiting, id, { gasLimit: 1000000 })
        return startTx
      })
      this.log('waiting for create and start')
      await tx.wait()

      this.log('done')
    } catch (err) {
      console.error('error making table: ', err)
      process.exit(1)
    }
  }
}

const diceRolledTopic = delphs.interface.getEventTopic('DiceRolled')
const getDiceRollFromReceipt = (receipt: ContractReceipt) => {
  const evt = receipt.logs.find((l) => {
    return l.topics[0] === diceRolledTopic
  })
  if (!evt) {
    throw new Error("passed a bad receipt with no DiceRolled evt")
  }
  return delphs.interface.parseLog(evt) as any as DiceRolledEvent
}

class TablePlayer {

  log: Debugger
  private playing: boolean

  singleton: SingletonQueue

  constructor() {
    this.log = debug('table-player')
    this.singleton = new SingletonQueue('table-player')
  }

  instantTableStarted() {
    this.log('table started, rolling the dice')
    this.singleton.push(async () => {
      try {
        this.log('singleton queue played play tables')
        return this.playTables()
      } catch (err) {
        console.error('error playing table: ', err)
        process.exit(1)
      }
    })
  }

  async handleTableStarted() {
    this.log('table started, waiting')
    await promiseWaiter(10000)
    this.instantTableStarted()
  }

  private async playTables() {
    try {
      if (this.playing) {
        console.error('tried to run twice')
        throw new Error('tried to run twice, exiting the program')
      }
      this.playing = true
      this.log('play tables')
      const ids = await orchestratorState.all()
      if (ids.length === 0) {
        this.log('no tables')
        return
      }
      const active = await Promise.all((ids).map(async (tableId) => {
        console.log('active: ', tableId)
        const [metadata, playerAddresses] = await Promise.all([
          delphs.tables(tableId),
          delphs.players(tableId)
        ])
        const teams = await Promise.all(playerAddresses.map(async (addr) => {
          return player.team(addr)
        }))

        const players = playerAddresses.reduce((memo, addr, i) => {
          return {
            ...memo,
            [addr]: teams[i],
          }
        }, {})

        return {
          id: tableId,
          metadata,
          start: metadata.startedAt,
          end: metadata.startedAt.add(metadata.gameLength),
          players,
        }
      }))
      this.log('actives: ', active.map((a) => ({ id: a.id, start: a.start.toNumber(), end: a.end.toNumber() })))
      const endings = active.map((tourn) => tourn.end).sort((a, b) => b.sub(a).toNumber()) // sort to largest first
      const currentTick = await delphs.latestRoll()

      this.log('rolling from ', currentTick.toNumber() + 1, 'to', endings[0].toNumber())

      for (let i = 0; i < endings[0].sub(currentTick).toNumber(); i++) {
        this.log('buffer')
        const tick = currentTick.add(i + 1).toNumber()

        mqttClient().publish(NO_MORE_MOVES_CHANNEL, JSON.stringify({ tick }))
        await promiseWaiter(STOP_MOVES_BUFFER * 1000)

        this.log('rolling', tick)
        const tx = await txSingleton.push(async () => {
          return await delphs.rollTheDice({ gasLimit: 250000 })
        })
        const receipt = await tx.wait()
        const diceRolledLog = getDiceRollFromReceipt(receipt)
        this.log('publish', tick)
        mqttClient().publish(ROLLS_CHANNEL, JSON.stringify({ txHash: tx.hash, tick, random: diceRolledLog.args.random, blockNumber: receipt.blockNumber }))
        this.log('waiting')
        await promiseWaiter((SECONDS_BETWEEN_ROUNDS - STOP_MOVES_BUFFER) * 1000)
      }

      await Promise.all(active.map(async (table) => {
        this.log('collecting results for', table.id)
        const runner = new BoardRunner(table.id)
        await runner.run()
        const rewards = runner.rewards()

        const memo: { gump: Record<string, { to: string, amount: BigNumber, team: BigNumber }>, accolades: { to: string, id: BigNumberish, amount: BigNumber }[] } = { gump: {}, accolades: [] }

        Object.keys(rewards.wootgump).forEach((playerId) => {
          const team = table.players[playerId]
          memo.gump[playerId] ||= { to: playerId, amount: BigNumber.from(0), team }
          memo.gump[playerId].amount = memo.gump[playerId].amount.add(BigNumber.from(rewards.wootgump[playerId]).mul(ONE))
          memo.gump[playerId].team = team
        })
        memo.accolades = memo.accolades.concat(rewards.ranked.slice(0, 3).map((w, i) => {
          return {
            id: i,
            amount: BigNumber.from(1),
            to: w.id,
          }
        }))
        if (rewards.quests.firstGump) {
          memo.accolades.push({
            to: rewards.quests.firstGump.id,
            amount: BigNumber.from(1),
            id: 3
          })
        }
        if (rewards.quests.firstBlood) {
          memo.accolades.push({
            to: rewards.quests.firstBlood.id,
            amount: BigNumber.from(1),
            id: 4
          })
        }
        Object.keys(rewards.quests.battlesWon).forEach((playerAddress) => {
          memo.accolades.push({
            to: playerAddress,
            id: 5,
            amount: BigNumber.from(rewards.quests.battlesWon[playerAddress])
          })
        })

        this.log('queuing bulk and prizes')
        await txSingleton.push(async () => {
          const tx = await wootgump.bulkMint(Object.values(memo.gump), { gasLimit: 8_000_000 })
          await tx.wait()
          this.log('wootgump prize tx: ', tx.hash)

          const accoladesTx = await accolades.multiUserBatchMint(memo.accolades, [], { gasLimit: 8_000_000 })
          await accoladesTx.wait()
          this.log('accoladesTx tx: ', accoladesTx.hash)

          const teamTx = await teamStats.register(Object.values(memo.gump).map((g) => ({ player: g.to, team: g.team, value: g.amount, tableId: keccak256(Buffer.from('no-table-recorded')) })), { gasLimit: 5_000_000 })
          await teamTx.wait()
          this.log('team tx: ', teamTx.hash)

          return orchestratorState.bulkRemove(active.map((table) => table.id), { gasLimit: 500_000 })
        })
      }))

      this.log('rolling complete')
    } catch (err) {
      console.error('error rolling: ', err)
      this.handleTableStarted()
    } finally {
      this.playing = false
    }
  }
}

async function main() {
  return new Promise((_resolve) => {
    console.log('running')
    // call the client to just get it setup
    mqttClient()

    const tableMaker = new TableMaker()
    const tablePlayer = new TablePlayer()
    new Pinger().start()

    debug.enable('table-player,table-maker,pinger')

    const lobbyRegistrationFilter = lobby.filters.RegisteredInterest(null)
    const orchestratorFilter = orchestratorState.filters.TableAdded(null)

    provider.on(lobbyRegistrationFilter, () => tableMaker.handleLobbyRegistration())
    provider.on(orchestratorFilter, () => tablePlayer.handleTableStarted())
    // at startup, just check for any running tables
    tablePlayer.instantTableStarted()
    // and if any tables need to be created
    tableMaker.instantLobbyRegistration()
  })
}

main()
