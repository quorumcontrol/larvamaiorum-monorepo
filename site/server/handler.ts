
import { BigNumber, BigNumberish, ContractReceipt, utils, Wallet } from "ethers";
import debug, { Debugger } from 'debug'
import { keccak256 } from "ethers/lib/utils";
import { faker } from '@faker-js/faker'
import { NonceManager } from '@ethersproject/experimental'
import * as dotenv from "dotenv";
import { getBytesAndCreateToken } from 'skale-relayer-contracts'
import KasumahRelayer from 'skale-relayer-contracts/lib/src/KasumahRelayer'
import { wrapContract } from 'kasumah-relay-wrapper'
import testnetBots from '../contracts/bots-testnet'
import mainnetBots from '../contracts/bots-mainnet'
import { OrchestratorState__factory, TeamStats2__factory } from "../contracts/typechain";
import { addresses, isTestnet } from "../src/utils/networks";
import { accoladesContract, delphsContract, delphsGumpContract, listKeeperContract, lobbyContract, playerContract, trustedForwarderContract } from "../src/utils/contracts";
import { questTrackerContract } from '../src/utils/questTracker'
import promiseWaiter from '../src/utils/promiseWaiter'
import SingletonQueue from '../src/utils/singletonQueue'
import { skaleProvider } from "../src/utils/skaleProvider";
import mqttClient, { NO_MORE_MOVES_CHANNEL, ROLLS_CHANNEL } from '../src/utils/mqtt'
import Pinger from "./pinger";
import { DelphsTable, DiceRolledEvent } from "../contracts/typechain/DelphsTable";
import BoardRunner from "../src/utils/BoardRunner";
import { memoize } from "../src/utils/memoize";
import ThenArg from '../src/utils/ThenArg'

dotenv.config({
  path: '.env.local'
})

const ONE = utils.parseEther('1')

const NUMBER_OF_ROUNDS = 15 // TODO: fix
const TABLE_SIZE = 8
const WOOTGUMP_MULTIPLIER = 24

const PAYOUT_TRACKER = keccak256(Buffer.from('delphs-needs-payout'))

const SECONDS_BETWEEN_ROUNDS = 10 // TODO: fix
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

const delphsWallet = new NonceManager(new Wallet(process.env.DELPHS_PRIVATE_KEY).connect(provider))
delphsWallet.getAddress().then((addr) => {
  console.log("Delph's address: ", addr)
})

const roller = Wallet.createRandom().connect(provider)

const lobby = lobbyContract("delphs", delphsWallet)
const delphs = delphsContract("delphs", delphsWallet)
const player = playerContract("delphs", delphsWallet)
const delphsGump = delphsGumpContract("delphs", delphsWallet)
const accolades = accoladesContract("delphs", delphsWallet)
const listKeeper = listKeeperContract("delphs", delphsWallet)

const orchestratorState = OrchestratorState__factory.connect(addresses().OrchestratorState, delphsWallet)
const teamStats = TeamStats2__factory.connect(addresses().TeamStats2, delphsWallet)
const questTracker = questTrackerContract().connect(delphsWallet)

const relayer = memoize(async () => {
  console.log('sending roller sfuel')
  console.log('sending value transfer')
  const sendTx = await delphsWallet.sendTransaction({
    value: utils.parseEther('0.5'),
    to: roller.address,
  })
  console.log('sending value transfer')
  await sendTx.wait()

  const token = await getBytesAndCreateToken(trustedForwarderContract(), delphsWallet.signer, roller)
  const kasumahRelayer = new KasumahRelayer(trustedForwarderContract().connect(roller), roller, delphsWallet.signer, token)
  return {
    relayer: kasumahRelayer,
    wrapped: {
      delphs: wrapContract<DelphsTable>(delphs, kasumahRelayer)
    }
  }
})

interface ActiveTable {
  id: string
  metadata: ThenArg<ReturnType<DelphsTable['tables']>>
  players: Record<string, BigNumber>
  start: BigNumber
  end: BigNumber
}

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

      const addressToPlayerWithSeed = async (address:string, isBot: boolean) => {
        const [name, gump] = await Promise.all([
          player.name(address),
          delphsGump.balanceOf(address),
        ])
        if (!name) {
          this.log(`${address} has no name`)
          return undefined
        }
        return {
          name,
          address,
          delphsGump: isBot ? gump.div(2) : gump,
          seed: hashString(`${id}-${player!.name}-${player!.address}`),
          isBot: isBot,
        }
      }
    
      const playersWithNamesAndSeeds = (await Promise.all([
        ...waiting.map((addr) => addressToPlayerWithSeed(addr, false)),
        ...(await getBots(botNumber)).map((bot) => addressToPlayerWithSeed(bot.address, true))
      ])).filter((p) => !!p)
      
      const tx = await txSingleton.push(async () => {
        this.log('doing create and start tx')
        const startTx = await delphs.createAndStart({
          id,
          players: playersWithNamesAndSeeds.map((p) => p!.address),
          seeds: playersWithNamesAndSeeds.map((p) => p!.seed),
          gameLength: NUMBER_OF_ROUNDS,
          owner: await delphsWallet.getAddress(),
          startedAt: 0,
          tableSize: TABLE_SIZE,
          wootgumpMultiplier: WOOTGUMP_MULTIPLIER,
          initialGump: playersWithNamesAndSeeds.map((p) => p!.delphsGump),
          attributes: [],
          autoPlay: playersWithNamesAndSeeds.map((p) => p!.isBot)
        }, { gasLimit: 3_000_000 })
        this.log('doing orchestrator state add')
        await orchestratorState.add(id, { gasLimit: 1000000 })
        await listKeeper.add(PAYOUT_TRACKER, id, { gasLimit: 2_000_000 })
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
    await promiseWaiter(5000)
    this.instantTableStarted()
  }

  private async idToActiveTable(tableId: string): Promise<ActiveTable> {
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
  }

  private async playTables() {
    try {
      const wrappedDelphs = (await relayer()).wrapped.delphs
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
      const active: ActiveTable[] = await Promise.all((ids).map(async (tableId) => {
        return this.idToActiveTable(tableId)
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
        const tx = await wrappedDelphs.rollTheDice({ gasLimit: 250000 })
        const receipt = await tx.wait()
        const diceRolledLog = getDiceRollFromReceipt(receipt)
        this.log('publish', tick)
        mqttClient().publish(ROLLS_CHANNEL, JSON.stringify({ txHash: tx.hash, tick, random: diceRolledLog.args.random, blockNumber: receipt.blockNumber }))
        this.log('waiting')
        await promiseWaiter((SECONDS_BETWEEN_ROUNDS - STOP_MOVES_BUFFER) * 1000)
      }
      await txSingleton.push(async () => {
        await Promise.all(active.map(async (table) => {
          return (await orchestratorState.remove(table.id, { gasLimit: 500_000 })).wait()
        }))
      })
      this.handlePayouts(active)

      this.log('rolling complete')
    } catch (err) {
      console.error('error rolling: ', err)
      this.handleTableStarted()
    } finally {
      this.playing = false
    }
  }

  async cleanupUnPaidTables() {
    const filter = listKeeper.filters.EntryAdded(PAYOUT_TRACKER, null)
    const latestBlock = await skaleProvider.getBlockNumber()
    this.log('querying')
    const evts = await listKeeper.queryFilter(filter, latestBlock - 4500, latestBlock)
    this.log('evt count: ', evts.length)
    const stillRunningIds = await orchestratorState.all()
    this.log("still running ids: ", stillRunningIds)

    const windowSize = 40
    let cursor = 0
    let doesNeedFixup:boolean[] = []
    let window = evts.slice(cursor, cursor + windowSize)

    while (window && window.length > 0) {
      const resp = await Promise.all(window.map(async (evt) => {
        this.log("before payout tracker: ", evt.args.entry)
        const payoutTracker = await listKeeper.contains(PAYOUT_TRACKER, evt.args.entry)
        this.log("after payout tracker: ", evt.args.entry)
        return payoutTracker && !stillRunningIds.includes(evt.args.entry)
      }))
      doesNeedFixup = doesNeedFixup.concat(resp)
      cursor += windowSize
      window = evts.slice(cursor, cursor + windowSize)
    }
    this.log('got through them all: ', doesNeedFixup)
    this.log('has fixups? ', doesNeedFixup.some((b) => b))

    // const doesNeedFixup = await Promise.all(evts.map(async (evt) => {
    //   this.log("before payout tracker: ", evt.args.entry)
    //   const payoutTracker = await listKeeper.contains(PAYOUT_TRACKER, evt.args.entry)
    //   this.log("after payout tracker: ", evt.args.entry)
    //   return payoutTracker && !stillRunningIds.includes(evt.args.entry)
    // }))


    console.log("payout tracker: ", doesNeedFixup)

    const stillNeedingIds = evts.filter((_evt, i) => doesNeedFixup[i])
    this.log("still needs paying: ", stillNeedingIds.length)
    const actives = (await Promise.all(stillNeedingIds.map(async (evt) => {
      return this.idToActiveTable(evt.args.entry)
    }))).filter((t) => t.start.gt(0))
    await this.handlePayouts(actives)
    const stillRunning = await Promise.all(stillRunningIds.map((id) => {
      return this.idToActiveTable(id)
    }))
    const latestRoll = await delphs.latestRoll()
    // now find the ones that are finished
    const needsCleanup = stillRunning.filter((table) => {
      return table.end.lte(latestRoll)
    })
    console.log('removing from orchestrator state', needsCleanup.length)
    await Promise.all(needsCleanup.map(async (table) => {
      return txSingleton.push(() => {
        console.log('removing, ', table.id)
        return orchestratorState.remove(table.id, { gasLimit: 500_000 })
      })
    }))
    console.log("tables that are finished count: ", needsCleanup.length)
    await this.handlePayouts(needsCleanup)
  }

  private async handlePayouts(active: ActiveTable[]) {
    await Promise.all(active.map(async (table) => {
      this.log('collecting results for', table.id)
      const runner = new BoardRunner(table.id)
      await runner.run()
      const rewards = runner.rewards()
      console.log("rewards: ", rewards)
      const memo: {
        gumpMint: Record<string, { to: string, amount: BigNumber, team: BigNumber }>, 
        gumpBurn: Record<string, { to: string, amount: BigNumber, team: BigNumber }>, 
        accolades: { to: string, id: BigNumberish, amount: BigNumber }[]
      } = { gumpMint: {}, gumpBurn: {}, accolades: [] }

      Object.keys(rewards.wootgump).forEach((playerId) => {
        const team = table.players[playerId]
        const reward = BigNumber.from(rewards.wootgump[playerId])

        if (reward.gt(0)) {
          memo.gumpMint[playerId] ||= { to: playerId, amount: BigNumber.from(0), team }
          memo.gumpMint[playerId].amount = memo.gumpMint[playerId].amount.add(reward).mul(ONE)
          memo.gumpMint[playerId].team = team
        }

        if (reward.lt(0)) {
          memo.gumpBurn[playerId] ||= { to: playerId, amount: BigNumber.from(0), team }
          memo.gumpBurn[playerId].amount = memo.gumpBurn[playerId].amount.add(reward).mul(-1).mul(ONE)
          memo.gumpBurn[playerId].team = team
        }
      })
      this.log("gump", memo.gumpMint, memo.gumpBurn)
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
        if (Object.keys(memo.gumpMint).length > 0) {
          const tx = await delphsGump.bulkMint(Object.values(memo.gumpMint), { gasLimit: 12_000_000 })
          this.log('delphsGump mint prize tx: ', tx.hash, Object.values(memo.gumpMint))
          await tx.wait()
        }

        if (Object.keys(memo.gumpBurn).length > 0) {
          const tx = await delphsGump.bulkBurn(Object.values(memo.gumpBurn), { gasLimit: 8_000_000 })
          this.log('delphsGump burn prize tx: ', tx.hash, Object.values(memo.gumpBurn))
          await tx.wait()
        }

        const accoladesTx = await accolades.multiUserBatchMint(memo.accolades, [], { gasLimit: 8_000_000 })
        this.log('accoladesTx tx: ', accoladesTx.hash, memo.accolades)
        await accoladesTx.wait()

        let stats = Object.values(memo.gumpMint).map((g) => ({ player: g.to, team: g.team, value: g.amount, tableId: table.id }))
        stats = stats.concat(Object.values(memo.gumpBurn).map((g) => ({ player: g.to, team: g.team, value: g.amount.mul(-1), tableId: table.id })))
        const teamTx = await teamStats.register(stats, { gasLimit: 5_000_000 })
        this.log('team tx: ', teamTx.hash)        
        await teamTx.wait()

        const quest = Object.keys(rewards.quests.battlesWon).map((player) => {
          const val = rewards.quests.battlesWon[player]
          const team = table.players[player]

          return {
            player,
            team,
            value: val,
            questId: keccak256(Buffer.from('battles-won')),
            tableId: table.id,
          }
        })
        const questTrackerTx = await questTracker.register(quest, { gasLimit: 5_000_000 })
        this.log('quest tracker tx: ', questTrackerTx.hash)
        await questTrackerTx.wait()
      })
    }))

    await txSingleton.push(async () => {
      return Promise.all(active.map(async (active) => {
        this.log('removing ', active.id)
        await listKeeper.remove(PAYOUT_TRACKER, active.id, { gasLimit: 5_000_000 })
      }))
    })
  }
}

async function main() {
  return new Promise(async (_resolve) => {
    console.log('running')
    // call the client to just get it setup
    mqttClient()

    const tableMaker = new TableMaker()
    const tablePlayer = new TablePlayer()
    new Pinger().start()

    // debug.enable('*')
    debug.enable('table-player,table-maker,pinger')
    console.log('cleaning up anything we messed up during last run')
    await tablePlayer.cleanupUnPaidTables()

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
