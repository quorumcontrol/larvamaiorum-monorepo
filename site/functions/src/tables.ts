import { randomUUID } from "crypto";
import { BigNumber, BigNumberish, utils, Wallet } from "ethers";
import { keccak256 } from "ethers/lib/utils";
import * as functions from "firebase-functions";
import KasumahRelayer from 'skale-relayer-contracts/lib/src/KasumahRelayer'
import { wrapContract } from 'kasumah-relay-wrapper'
import { db } from "./app"
import testnetBots from '../../contracts/bots-testnet'
import mainnetBots from '../../contracts/bots-mainnet'
import { addresses, isTestnet } from '../../src/utils/networks'
import SingletonQueue from '../../src/utils/singletonQueue'
import { skaleProvider } from "../../src/utils/skaleProvider";
import { accoladesContract, delphsContract, delphsGumpContract, playerContract, trustedForwarderContract } from "../../src/utils/contracts";
import { questTrackerContract } from "../../src/utils/questTracker";
import { defineSecret } from "firebase-functions/params";
import { memoize } from "../../src/utils/memoize";
import { Accolades, DelphsGump, DelphsTable, Player, QuestTracker, TeamStats, TeamStats2__factory } from "../../contracts/typechain";
import Warrior, { WarriorState, WarriorStats } from "../../src/boardLogic/Warrior"
import { defaultInitialInventory, InventoryItem } from "../../src/boardLogic/items";
import { Transaction } from "firebase-admin/firestore";
import { TableStatus } from '../../src/utils/tables'
import { addressToUid, uidToAddress } from '../../src/utils/firebaseHelpers'
import Grid from "../../src/boardLogic/Grid";
import { getBytesAndCreateToken } from "skale-relayer-contracts/lib/src/tokenCreator";

const delphsPrivateKey = defineSecret("DELPHS_PRIVATE_KEY")

const ONE = utils.parseEther('1')

const NUMBER_OF_ROUNDS = 10
const TABLE_SIZE = 8
const WOOTGUMP_MULTIPLIER = 24

const botSetup = isTestnet ? testnetBots : mainnetBots

// // const SECONDS_BETWEEN_ROUNDS = 15
// // const STOP_MOVES_BUFFER = 4 // seconds before the next round to stop moves

function hashString(msg: string) {
  return keccak256(Buffer.from(msg))
}

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

const walletAndContracts = memoize(async (delphsKey: string) => {
  functions.logger.debug("delphs private key")
  if (!delphsKey) {
    functions.logger.error("missing private key", process.env)
    throw new Error("must have a DELPHS private key")
  }
  const provider = skaleProvider

  const relayWallet = Wallet.createRandom().connect(provider)
  functions.logger.info("Relay address: ", relayWallet.address)

  const delphsWallet = new Wallet(delphsKey).connect(provider)
  delphsWallet.getAddress().then((addr) => {
    functions.logger.info("Delph's address: ", addr)
  })

  const sendTx = await delphsWallet.sendTransaction({
    value: utils.parseEther('0.1'),
    to: relayWallet.address,
  })
  functions.logger.info("funded relayer", { tx: sendTx.hash, relayer: relayWallet.address })

  const delphs = delphsContract()
  const player = playerContract()
  const delphsGump = delphsGumpContract()
  const accolades = accoladesContract()
  const teamStats = TeamStats2__factory.connect(addresses().TeamStats2, provider)
  const questTracker = questTrackerContract()
  const trustedForwarder = trustedForwarderContract()

  const token = await getBytesAndCreateToken(trustedForwarder, delphsWallet, relayWallet)
  const kasumahRelayer = new KasumahRelayer(trustedForwarder.connect(relayWallet), relayWallet, delphsWallet, token)

  return {
    relayer: kasumahRelayer,
    delphsAddress: delphsWallet.address,
    delphs: wrapContract<DelphsTable>(delphs, kasumahRelayer),
    player: wrapContract<Player>(player, kasumahRelayer),
    delphsGump: wrapContract<DelphsGump>(delphsGump, kasumahRelayer),
    accolades: wrapContract<Accolades>(accolades, kasumahRelayer),
    teamStats: wrapContract<TeamStats>(teamStats, kasumahRelayer),
    questTracker: wrapContract<QuestTracker>(questTracker, kasumahRelayer)
  }
})

export const onLobbyWrite = functions
  .runWith({ 
    secrets: [delphsPrivateKey.name], 
    failurePolicy: true
  })
  .firestore
  .document("/delphsLobby/{player}")
  .onWrite(async (_change, context) => {
    if (context.eventType == "google.firestore.document.delete") {
      return
    }
    const playerUid = context.params.player
    if (!playerUid) {
      return
    }
    functions.logger.debug("write initiated by", playerUid)

    // now let's create the table
    return db.runTransaction(async (transaction) => {
      // get all the players waiting

      const snapshot = await db.collection("/delphsLobby").get()
      const playerUids: string[] = []
      snapshot.forEach((doc) => {
        playerUids.push(doc.id)
      })

      if (playerUids.length === 0) {
        return
      }
      const tableId = hashString(randomUUID())
      const { delphs, player, delphsGump, delphsAddress } = await walletAndContracts(process.env[delphsPrivateKey.name]!)

      functions.logger.debug("player uids: ", playerUids)

      const waiting = playerUids.map((uid) => uid.match(/w:(.+)/)![1])

      const botNumber = Math.max(10 - playerUids.length, 0)
      const id = tableId

      const addressToPlayerWithSeed = async (address: string, isBot: boolean) => {
        const [name, team, gump] = await Promise.all([
          player.name(address),
          player.team(address),
          delphsGump.balanceOf(address),
        ])
        if (!name) {
          functions.logger.debug(`${address} has no name`)
          return undefined
        }
        return {
          name,
          address,
          delphsGump: gump,
          team: team.toNumber(),
          seed: hashString(`${id}-${player!.name}-${player!.address}`),
          isBot: isBot,
        }
      }

      const playersWithNamesAndSeeds = (await Promise.all([
        ...waiting.map((addr) => addressToPlayerWithSeed(addr, false)),
        ...(await getBots(botNumber)).map((bot) => addressToPlayerWithSeed(bot.address, true))
      ])).filter((p) => !!p)

      const tx = await txSingleton.push(async () => {
        functions.logger.debug('doing create and start tx', { tableId })

        const startTx = await delphs.createAndStart({
          id,
          players: playersWithNamesAndSeeds.map((p) => p!.address),
          seeds: playersWithNamesAndSeeds.map((p) => p!.seed),
          gameLength: NUMBER_OF_ROUNDS,
          owner: delphsAddress,
          startedAt: 0,
          tableSize: TABLE_SIZE,
          wootgumpMultiplier: WOOTGUMP_MULTIPLIER,
          initialGump: playersWithNamesAndSeeds.map((p) => p!.delphsGump),
          attributes: [],
          autoPlay: playersWithNamesAndSeeds.map((p) => p!.isBot)
        }, { gasLimit: 3_000_000 })
        return startTx
      })
      functions.logger.debug('waiting for create and start', { tableId })
      await tx.wait()

      functions.logger.debug("all players", { tableId, playerUids })
      const newDoc = db.doc(`/tables/${tableId}`)
      transaction.create(newDoc, {
        players: playerUids,
        seeds: playersWithNamesAndSeeds.reduce((memo, seed) => {
          return {
            ...memo,
            [seed!.address]: {
              ...seed,
              delphsGump: Math.floor(parseFloat(utils.formatEther(seed!.delphsGump)))
            }
          }
        }, {}),
        tableSize: TABLE_SIZE,
        rounds: NUMBER_OF_ROUNDS,
        wootgumpMultiplier: WOOTGUMP_MULTIPLIER,
        round: 0,
        status: TableStatus.UNSTARTED,
      })

      playersWithNamesAndSeeds.forEach((seed) => {
        if (!seed?.isBot) {
          transaction.create(db.doc(`tables/${tableId}/moves/${addressToUid(seed!.address)}`), {})
        }
      })

      playerUids.forEach((player) => {
        const lobbyRef = db.doc(`delphsLobby/${player}`)
        const playerTableRef = db.doc(`playerLocations/${player}`)
        transaction.delete(lobbyRef)
        transaction.create(playerTableRef, {
          table: tableId,
        })
      })
    })
  })


type QueryDoc = FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>

async function _roller() {
  functions.logger.info('roller rolling')
  const { delphs } = await walletAndContracts(process.env[delphsPrivateKey.name]!)
  await txSingleton.push(async () => {
    return delphs.rollTheDice()
  })
  const latest = await delphs.latestRoll()
  const randomness = await delphs.rolls(latest)
  const batch = db.batch()
  batch.create(db.doc(`/rolls/${latest.toNumber()}`), { roll: latest.toNumber(), randomness })
  batch.set(db.doc(`/rolls/latest`), { roll: latest.toNumber(), randomness })
  return batch.commit()
}

// emulators can't actually exec ever 10 seconds
export const roller = functions.runWith({ secrets: [delphsPrivateKey.name] }).pubsub.schedule("every 14 seconds").onRun(_roller)
export const rollerTest = functions.runWith({ secrets: [delphsPrivateKey.name] }).https.onRequest((req, resp) => {
  _roller().then(() => {
    resp.sendStatus(200)
  }).catch((err) => {
    functions.logger.error('problem rolling', err)
    resp.sendStatus(500)
  })
})

interface Roll {
  roll: number,
  randomness: string,
}

async function _startTable(transaction: Transaction, delphs: DelphsTable, table: QueryDoc, roll: Roll) {
  functions.logger.info('starting table', table.id)
  const warriors: WarriorStats[] = await Promise.all(Object.values(table.data().seeds).map(async (seed: any) => {
    const stats = await delphs.statsForPlayer(table.id, seed.address)
    return {
      id: seed.address,
      name: seed.name,
      attack: stats.attack.toNumber(),
      defense: stats.defense.toNumber(),
      initialHealth: stats.health.toNumber(),
      initialGump: seed.delphsGump,
      initialInventory: defaultInitialInventory,
      autoPlay: seed.isBot,
    }
  }))
  functions.logger.debug('warriors', table.id, warriors)
  return transaction.update(table.ref, {
    warriors,
    status: TableStatus.STARTED,
    startRoll: roll
  })
}

export const startTables = functions.runWith({ secrets: [delphsPrivateKey.name] })
  .firestore
  .document('rolls/{rollNumber}')
  .onCreate(async (roll, ctx) => {
    const query = db.collection('/tables').where("status", "==", TableStatus.UNSTARTED)

    return db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(query)
      if (snapshot.size == 0) {
        return
      }
      const { delphs } = await walletAndContracts(process.env[delphsPrivateKey.name]!)
      const rollData = roll.data()

      const promises: Promise<any>[] = []
      snapshot.forEach((table) => {
        promises.push(_startTable(transaction, delphs, table, { roll: rollData.roll, randomness: rollData.randomness }))
      })
      return Promise.all(promises)
    })
  })

export const completeTables = functions.runWith({ secrets: [delphsPrivateKey.name] })
  .firestore
  .document('rolls/{rollNumber}')
  .onCreate(async (_roll, { params }) => {
    const rollNumber = parseInt(params.rollNumber)
    const query = db.collection('/tables').where("status", "==", TableStatus.STARTED)

    return db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(query)
      if (snapshot.size == 0) {
        functions.logger.debug('no tables in progress')
        return
      }

      snapshot.forEach((table) => {
        const tableData = table.data()
        const start = tableData.startRoll.roll
        const len = tableData.rounds
        functions.logger.debug("table check", {
          tableId: table.id,
          start: tableData.startRoll,
          rounds: tableData.rounds,
          rollNumber,
          len,
          calculatedRoll: (rollNumber - start),
        })
        if ((rollNumber - start) >= len) {
          functions.logger.debug("updating to complete")
          tableData.players.forEach((playerUid: string) => {
            transaction.delete(db.doc(`/playerLocations/${playerUid}`))
          })
          transaction.update(table.ref, {
            status: TableStatus.COMPLETE
          })
        }
      })
    })
  })

export const handleCompletedTables = functions
  .runWith({
    secrets: [delphsPrivateKey.name],
    failurePolicy: true,
  })
  .firestore
  .document('tables/{tableId}')
  .onUpdate(async (change) => {
    const table = change.after
    const tableData = table.data()
    if (tableData.status !== TableStatus.COMPLETE) {
      return
    }
    const contracts = await walletAndContracts(process.env[delphsPrivateKey.name]!)
    return completeTheTable(contracts, table)
  })

interface CompleteTableContracts {
  delphsGump: DelphsGump
  accolades: Accolades
  teamStats: TeamStats
  questTracker: QuestTracker
}

async function completeTheTable({ delphsGump, accolades, teamStats, questTracker }: CompleteTableContracts, tableDoc: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>) {
  if (!delphsGump || !accolades || !teamStats || !questTracker) {
    throw new Error('missing contracts')
  }
  const snapshot = await db.collection(`/tables/${tableDoc.id}/moves`).get()
  const moves: Record<string, any> = {}
  snapshot.forEach((moveDoc) => {
    functions.logger.debug("move doc: ", moveDoc.id)
    moves[uidToAddress(moveDoc.id.toString())] = moveDoc.data()
  })

  const table = tableDoc.data()
  table.id = tableDoc.id

  const grid = new Grid({
    warriors: table.warriors.map((ws: WarriorState) => new Warrior(ws)),
    sizeX: table.tableSize,
    sizeY: table.tableSize,
    wootgumpMultipler: table.wootgumpMultiplier,
    gameLength: table.rounds,
    seed: table.startRoll.randomness,
  })

  grid.start(table.startRoll.randomness)
  const start = table.startRoll.roll
  const len = table.rounds
  const rolls = await db.collection(`/rolls`).where('roll', '>', start).limit(len).orderBy('roll').get()

  rolls.forEach((rollDoc) => {
    if (rollDoc.id == 'latest') {
      return
    }
    const { randomness, roll } = rollDoc.data()
    const destinations: Record<string, { x: number, y: number }> = {}
    const itemPlays: Record<string, InventoryItem> = {}

    Object.keys(moves).forEach((player, i) => {
      const move = moves[player][roll - 1]
      if (!move) {
        return
      }
      if (move.destination) {
        destinations[player] = move.destination
      }
      if (move.item) {
        itemPlays[player] = move.item
      }
    })
    grid.handleTick(randomness, destinations, itemPlays)
  })

  const rewards = grid.rewards()
  functions.logger.info("rewards", { tableId: tableDoc.id, rewards })
  const memo: {
    gumpMint: Record<string, { to: string, amount: BigNumber, team: BigNumber }>,
    gumpBurn: Record<string, { to: string, amount: BigNumber, team: BigNumber }>,
    accolades: { to: string, id: BigNumberish, amount: BigNumber }[]
  } = { gumpMint: {}, gumpBurn: {}, accolades: [] }

  Object.keys(rewards.wootgump).forEach((playerId) => {
    const team = table.seeds[playerId].team
    const reward = BigNumber.from(rewards.wootgump[playerId]).mul(ONE)
    functions.logger.debug("calculating rewards for", {
      playerId,
      team,
    })
    if (reward.gt(0)) {
      // bots get 1/4 of their earnings
      const calculatedReward = team == 0 ? reward.div(4) : reward
      if (team === 0) {
        functions.logger.debug(`reduce ${playerId} from ${utils.formatEther(reward)} to ${utils.formatEther(calculatedReward)}`)
      }
      memo.gumpMint[playerId] ||= { to: playerId, amount: BigNumber.from(0), team }
      memo.gumpMint[playerId].amount = memo.gumpMint[playerId].amount.add(calculatedReward)
      memo.gumpMint[playerId].team = team
    }

    if (reward.lt(0)) {
      memo.gumpBurn[playerId] ||= { to: playerId, amount: BigNumber.from(0), team }
      memo.gumpBurn[playerId].amount = memo.gumpBurn[playerId].amount.add(reward).mul(-1)
      memo.gumpBurn[playerId].team = team
    }
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
  await txSingleton.push(async () => {
    if (Object.keys(memo.gumpMint).length > 0) {
      const tx = await delphsGump.bulkMint(Object.values(memo.gumpMint), { gasLimit: 12_000_000 })
      functions.logger.debug('delphsGump mint prize tx: ', tx.hash, Object.values(memo.gumpMint))
      await tx.wait()
    }

    if (Object.keys(memo.gumpBurn).length > 0) {
      const tx = await delphsGump.bulkBurn(Object.values(memo.gumpBurn), { gasLimit: 8_000_000 })
      functions.logger.debug('delphsGump burn prize tx: ', tx.hash, Object.values(memo.gumpBurn))
      await tx.wait()
    }

    const accoladesTx = await accolades.multiUserBatchMint(memo.accolades, [], { gasLimit: 8_000_000 })
    functions.logger.debug('accoladesTx tx: ', accoladesTx.hash, memo.accolades)
    await accoladesTx.wait()

    let stats = Object.values(memo.gumpMint).map((g) => ({ player: g.to, team: g.team, value: g.amount, tableId: table.id }))
    stats = stats.concat(Object.values(memo.gumpBurn).map((g) => ({ player: g.to, team: g.team, value: g.amount.mul(-1), tableId: table.id })))
    const teamTx = await teamStats.register(stats, { gasLimit: 5_000_000 })
    functions.logger.debug('team tx: ', teamTx.hash)
    await teamTx.wait()

    const quest = Object.keys(rewards.quests.battlesWon).map((player) => {
      const val = rewards.quests.battlesWon[player]
      const team = table.seeds[player].team

      return {
        player,
        team,
        value: val,
        questId: keccak256(Buffer.from('battles-won')),
        tableId: table.id,
      }
    })
    const questTrackerTx = await questTracker.register(quest, { gasLimit: 5_000_000 })
    functions.logger.debug('quest tracker tx: ', questTrackerTx.hash)
    await questTrackerTx.wait()
    db.doc(tableDoc.ref.path).update({
      status: TableStatus.PAID
    })
  })
}
