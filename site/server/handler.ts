
import { ContractReceipt, Wallet } from "ethers";
import debug, { Debugger } from 'debug'
import { keccak256 } from "ethers/lib/utils";
import { faker } from '@faker-js/faker'
import { NonceManager } from '@ethersproject/experimental'
import * as dotenv from "dotenv";
import botSetup from '../contracts/bots'
import { OrchestratorState__factory } from "../contracts/typechain";
import { addresses } from "../src/utils/networks";
import { delphsContract, lobbyContract, playerContract } from "../src/utils/contracts";
import promiseWaiter from '../src/utils/promiseWaiter'
import SingletonQueue from '../src/utils/singletonQueue'
import { skaleProvider } from "../src/utils/skaleProvider";
import mqttClient, { NO_MORE_MOVES_CHANNEL, ROLLS_CHANNEL } from '../src/utils/mqtt'
import Pinger from "./pinger";
import { DiceRolledEvent } from "../contracts/typechain/DelphsTable";

dotenv.config({
  path: '.env.local'
})

const NUMBER_OF_ROUNDS = 30
const SECONDS_BETWEEN_ROUNDS = 15
const STOP_MOVES_BUFFER = 4 // seconds before the next round to stop moves

if (!process.env.env_delphsPrivateKey) {
  console.error('no private key')
  throw new Error("must have a DELPHS private key")
}

function hashString(msg: string) {
  return keccak256(Buffer.from(msg))
}

async function getBots(num: number) {
  const botNames = Object.keys(botSetup)
  return botNames.slice(0, num).map((name) => {
    return {
      name,
      ...botSetup[name]
    }
  })
}

const singleton = new SingletonQueue()

const provider = skaleProvider

const wallet = new NonceManager(new Wallet(process.env.env_delphsPrivateKey!).connect(provider))

const lobby = lobbyContract().connect(wallet)
const delphs = delphsContract().connect(wallet)
const player = playerContract().connect(wallet)
const orchestratorState = OrchestratorState__factory.connect(addresses().OrchestratorState, wallet)

class TableMaker {
  log: Debugger

  constructor() {
    this.log = debug('table-maker')
  }

  instantLobbyRegistration() {
    this.log('wait over, doing table maker')
    singleton.push(async () => {
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
      const rounds = NUMBER_OF_ROUNDS

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

      const tx = await delphs.createAndStart(id, playersWithNamesAndSeeds.map((p) => p.address!), playersWithNamesAndSeeds.map((p) => p.seed), rounds, await wallet.getAddress(), { gasLimit: 1500000 })
      this.log('table id: ', id, 'tx: ', tx.hash)
      // on staging we do not have mtm
      await orchestratorState.add(id, { gasLimit: 1000000 })
      await lobby.takeAddresses(waiting, id, { gasLimit: 1000000 })
      await tx.wait()

      this.log('done')
    } catch (err) {
      console.error('error making table: ', err)
      process.exit(1)
    }
  }
}


// const findBattleCompleted = (receipt:providers.TransactionReceipt) => {
//   const evt = receipt.logs.find((log) => {
//     return log.topics[0] === battleCompletedTopic
//   })
//   if (!evt) {
//     throw new Error('bad transaction hash: missing battle completed topic')
//   }
//   const parsedEvt = battleInterface.parseLog(evt)
//   console.log('parsed event: ', parsedEvt)
//   return parsedEvt as unknown as  BattleCompletedEvent
// }

const diceRolledTopic = delphs.interface.getEventTopic('DiceRolled')
const getDiceRollFromReceipt = (receipt:ContractReceipt) => {
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

  constructor() {
    this.log = debug('table-player')
  }

  instantTableStarted() {
    this.log('table started, rolling the dice')
    singleton.push(async () => {
      try {
        return await this.playTables()
      } catch (err) {
        console.error('error playing table: ', err)
        process.exit(1)
      }
    })
  }

  async handleTableStarted() {
    this.log('table started, waiting')
    await promiseWaiter(15000)
    this.instantTableStarted()
  }

  private async playTables() {
    try {
      this.log('play tables')
      const ids = await orchestratorState.all()
      if (ids.length === 0) {
        this.log('no tables')
        return
      }
      const active = await Promise.all((ids).map(async (tableId) => {
        this.log('active: ', tableId)
        const metadata = await delphs.tables(tableId)
        return {
          id: tableId,
          metadata,
          start: metadata.startedAt,
          end: metadata.startedAt.add(metadata.gameLength)
        }
      }))
      const endings = active.map((tourn) => tourn.end).sort((a, b) => b.sub(a).toNumber()) // sort to largest first
      const currentTick = await delphs.latestRoll()

      this.log('rolling from ', currentTick.toNumber(), 'to', endings[0].toNumber())

      for (let i = 0; i < endings[0].sub(currentTick).toNumber(); i++) {
        this.log('buffer')
        const tick = currentTick.add(i+1).toNumber()

        mqttClient().publish(NO_MORE_MOVES_CHANNEL, JSON.stringify({ tick }))
        await promiseWaiter(STOP_MOVES_BUFFER * 1000)

        this.log('rolling')
        const tx = await delphs.rollTheDice({ gasLimit: 250000 })
        const receipt = await tx.wait()
        const diceRolledLog = getDiceRollFromReceipt(receipt)

        mqttClient().publish(ROLLS_CHANNEL, JSON.stringify({ txHash: tx.hash, tick, random: diceRolledLog.args.random, blockNumber: receipt.blockNumber }))
        this.log('waiting')
        await promiseWaiter((SECONDS_BETWEEN_ROUNDS - STOP_MOVES_BUFFER) * 1000)
      }
      this.log('bulk remove')
      await orchestratorState.bulkRemove(active.map((table) => table.id), { gasLimit: 500000 })
      this.log('rolling complete')
    } catch (err) {
      console.error('error rolling: ', err)
      this.handleTableStarted()
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
