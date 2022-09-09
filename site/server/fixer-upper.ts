
import { BigNumber, BigNumberish, utils, Wallet } from "ethers";
import { NonceManager } from '@ethersproject/experimental'
import * as dotenv from "dotenv";
import { accoladesContract, delphsContract, lobbyContract, playerContract, wootgumpContract } from "../src/utils/contracts";
import SingletonQueue from '../src/utils/singletonQueue'
import { skaleProvider } from "../src/utils/skaleProvider";
import BoardRunner from "../src/utils/BoardRunner";


dotenv.config({
  path: '.env.local'
})

const log = console.log

const accoladesOnly = [
]

const ids = accoladesOnly


// const ids = [

// ]

const ONE = utils.parseEther('1')

if (!process.env.DELPHS_PRIVATE_KEY) {
  console.error('no private key')
  throw new Error("must have a DELPHS private key")
}

const txSingleton = new SingletonQueue()

const provider = skaleProvider

const wallet = new NonceManager(new Wallet(process.env.FIXER_UPPER_PRIVATE_KEY!).connect(provider))
// const wallet = new NonceManager(new Wallet(process.env.DELPHS_PRIVATE_KEY).connect(provider))

const lobby = lobbyContract().connect(wallet)
const delphs = delphsContract().connect(wallet)
const player = playerContract().connect(wallet)
const wootgump = wootgumpContract().connect(wallet)
const accolades = accoladesContract().connect(wallet)

async function fixit() {
  try {
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
    log('actives: ', active.map((a) => ({ id: a.id, start: a.start.toNumber(), end: a.end.toNumber() })))

    await Promise.all(active.map(async (table) => {
      log('collecting results for', table.id)
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

      log('queuing bulk and prizes')
      await txSingleton.push(async () => {
        // const tx = await wootgump.bulkMint(Object.values(memo.gump), { gasLimit: 8_000_000 })
        // await tx.wait()
        // log('wootgump prize tx: ', tx.hash)

        const accoladesTx = await accolades.multiUserBatchMint(memo.accolades, [], { gasLimit: 8_000_000 })
        await accoladesTx.wait()
        log('accoladesTx tx: ', accoladesTx.hash)
      })
    }))

    log('rolling complete')
  } catch (err) {
    console.error('caught error', err)
  } finally {
    log('done')
  }
}

async function main() {
  return new Promise(async (_resolve) => {
    console.log('running')
    await fixit()
    // // call the client to just get it setup
    // mqttClient()

    // const tableMaker = new TableMaker()
    // const tablePlayer = new TablePlayer()
    // new Pinger().start()

    // debug.enable('table-player,table-maker,pinger')

    // const lobbyRegistrationFilter = lobby.filters.RegisteredInterest(null)
    // const orchestratorFilter = orchestratorState.filters.TableAdded(null)

    // provider.on(lobbyRegistrationFilter, () => tableMaker.handleLobbyRegistration())
    // provider.on(orchestratorFilter, () => tablePlayer.handleTableStarted())
    // // at startup, just check for any running tables
    // tablePlayer.instantTableStarted()
    // // and if any tables need to be created
    // tableMaker.instantLobbyRegistration()
  })
}

main()
