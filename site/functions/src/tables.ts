import { randomUUID } from "crypto";
import "./app";
import { BigNumber, BigNumberish, utils } from "ethers";
import { keccak256 } from "ethers/lib/utils";
import * as functions from "firebase-functions";
import { appFunctions, db } from "./app"
import testnetBots from "../../contracts/bots-testnet"
import mainnetBots from "../../contracts/bots-mainnet"
import { isTestnet } from "../../src/utils/networks"
import SingletonQueue from "../../src/utils/singletonQueue"
import { Accolades, DelphsGump, DelphsTable, QuestTracker, TeamStats } from "../../contracts/typechain";
import Warrior, { WarriorState, WarriorStats } from "../../src/boardLogic/Warrior"
import { defaultInitialInventory, InventoryItem } from "../../src/boardLogic/items";
import { Transaction } from "firebase-admin/firestore";
import { TableStatus } from "../../src/utils/tables"
import { addressToUid, uidToAddress } from "../../src/utils/firebaseHelpers"
import Grid from "../../src/boardLogic/Grid";
import { delphsPrivateKey, walletAndContracts } from "./wallets";

type QueryDoc = FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>

const ONE = utils.parseEther("1")

const NUMBER_OF_ROUNDS = 12
const TABLE_SIZE = 8
const WOOTGUMP_MULTIPLIER = 20

const TIME_BETWEEN_ROLLS = 10

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
    // you"ll find more details about that syntax in later chapters
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

    // now let"s create the table
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
        const [name, onchainTeam, gump] = await Promise.all([
          player.name(address),
          player.team(address),
          delphsGump.balanceOf(address),
        ])
        if (!name) {
          functions.logger.debug(`${address} has no name`)
          return undefined
        }

        // if the address is a bot, then leave number 13, otherwise if the address is human, use team #13 (Novus Ludio)
        const team = onchainTeam.eq(0) ? BigNumber.from(isBot ? 0: 13) : onchainTeam

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
        functions.logger.debug("doing create and start tx", { tableId })

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
      functions.logger.debug("waiting for create and start", { tableId })
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

const _roller = async () => {
  try {
    functions.logger.info("roll the dice")
    const snapshot = await db.collection("/tables").where("status", "in", [TableStatus.UNSTARTED, TableStatus.STARTED]).get()
    if (snapshot.size == 0) {
      functions.logger.info("skipping roll because no running tables")
      return
    }
    const { delphs } = await walletAndContracts(process.env[delphsPrivateKey.name]!)

    functions.logger.debug("roller rolling")
    const tx = await txSingleton.push(async () => {
      return delphs.rollTheDice()
    })
    await tx.wait()
    functions.logger.debug("roller complete")
    const latest = await delphs.latestRoll()
    const randomness = await delphs.rolls(latest)
    functions.logger.debug("writing roll")

    const batch = db.batch()
    batch.create(db.doc(`/rolls/${latest.toNumber()}`), { roll: latest.toNumber(), randomness })
    batch.set(db.doc("/rolls/latest"), { roll: latest.toNumber(), randomness })
    await batch.commit()
  } catch (err) {
    functions.logger.error("error rolling", err)
  } finally {
    functions.logger.debug("done")
    const doc = await db.doc("_internal/stopRolling").get()
    if (doc.exists) {
      return
    }
    // otherwise let's roll again
    await enqueueRoll()
    return
  }
}

export const roller = functions
  .runWith({
    secrets: [delphsPrivateKey.name],
    memory: "512MB",
  })
  .tasks.taskQueue({
    retryConfig: {
      maxAttempts: 5,
      minBackoffSeconds: 60,
    },
    rateLimits: {
      maxConcurrentDispatches: 1,
    },
  }).onDispatch(_roller)

const enqueueRoll = async () => {
  functions.logger.debug("enqueueing roll")
  if (process.env.FUNCTIONS_EMULATOR) {
    setTimeout(_roller, TIME_BETWEEN_ROLLS * 1000)
    return
  }
  // otherwise we want to enqueue another roll
  const queue = appFunctions.taskQueue("roller");
  await queue.enqueue(
    {
      id: `roll-${randomUUID()}`,
    },
    {
      scheduleDelaySeconds: TIME_BETWEEN_ROLLS,
      dispatchDeadlineSeconds: 60 * 5 // 5 minutes
    },
  )
}

export const startRolling = functions
  .runWith({
    secrets: [delphsPrivateKey.name],
  })
  .https
  .onRequest(async (req, resp) => {
    functions.logger.debug("enqueue")
    enqueueRoll()
    resp.sendStatus(200)
  })

interface Roll {
  roll: number,
  randomness: string,
}

async function _startTable(transaction: Transaction, delphs: DelphsTable, table: QueryDoc, roll: Roll) {
  functions.logger.info("starting table", table.id)
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
  functions.logger.debug("warriors", table.id, warriors)
  return transaction.update(table.ref, {
    warriors,
    status: TableStatus.STARTED,
    startRoll: roll
  })
}

export const startTables = functions.runWith({ secrets: [delphsPrivateKey.name] })
  .firestore
  .document("rolls/{rollNumber}")
  .onCreate(async (roll, ctx) => {
    const query = db.collection("/tables").where("status", "==", TableStatus.UNSTARTED)

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

export const completeTables = functions.runWith({ secrets: [delphsPrivateKey.name], memory: "1GB" })
  .firestore
  .document("rolls/{rollNumber}")
  .onCreate(async (_roll, { params }) => {
    const rollNumber = parseInt(params.rollNumber)
    const query = db.collection("/tables").where("status", "==", TableStatus.STARTED)

    return db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(query)
      if (snapshot.size == 0) {
        functions.logger.debug("no tables in progress")
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
    memory: "1GB",
  })
  .firestore
  .document("tables/{tableId}")
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
    throw new Error("missing contracts")
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
  const rolls = await db.collection("/rolls").where("roll", ">", start).limit(len).orderBy("roll").get()

  rolls.forEach((rollDoc) => {
    if (rollDoc.id == "latest") {
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
      functions.logger.debug("delphsGump mint prize tx: ", tx.hash, Object.values(memo.gumpMint))
      await tx.wait()
    }

    if (Object.keys(memo.gumpBurn).length > 0) {
      const tx = await delphsGump.bulkBurn(Object.values(memo.gumpBurn), { gasLimit: 8_000_000 })
      functions.logger.debug("delphsGump burn prize tx: ", tx.hash, Object.values(memo.gumpBurn))
      await tx.wait()
    }

    const accoladesTx = await accolades.multiUserBatchMint(memo.accolades, [], { gasLimit: 8_000_000 })
    functions.logger.debug("accoladesTx tx: ", accoladesTx.hash, memo.accolades)
    await accoladesTx.wait()

    let stats = Object.values(memo.gumpMint).map((g) => ({ player: g.to, team: g.team, value: g.amount, tableId: table.id }))
    stats = stats.concat(Object.values(memo.gumpBurn).map((g) => ({ player: g.to, team: g.team, value: g.amount.mul(-1), tableId: table.id })))
    const teamTx = await teamStats.register(stats, { gasLimit: 5_000_000 })
    functions.logger.debug("team tx: ", teamTx.hash)
    await teamTx.wait()

    const quest = Object.keys(rewards.quests.battlesWon).map((player) => {
      const val = rewards.quests.battlesWon[player]
      const team = table.seeds[player].team

      return {
        player,
        team,
        value: val,
        questId: keccak256(Buffer.from("battles-won")),
        tableId: table.id,
      }
    })
    const questTrackerTx = await questTracker.register(quest, { gasLimit: 5_000_000 })
    functions.logger.debug("quest tracker tx: ", questTrackerTx.hash)
    await questTrackerTx.wait()
    db.doc(tableDoc.ref.path).update({
      status: TableStatus.PAID
    })
  })
}
