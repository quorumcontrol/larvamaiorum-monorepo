import { randomUUID } from "crypto";
import { utils, Wallet } from "ethers";
import { keccak256 } from "ethers/lib/utils";
import { NonceManager } from '@ethersproject/experimental'
import * as functions from "firebase-functions";
import { db } from "./app"
import testnetBots from '../../contracts/bots-testnet'
import mainnetBots from '../../contracts/bots-mainnet'
// import { memoize } from "../../src/utils/memoize";
import { isTestnet } from '../../src/utils/networks'
import SingletonQueue from '../../src/utils/singletonQueue'
import { skaleProvider } from "../../src/utils/skaleProvider";
import { delphsContract, delphsGumpContract, playerContract } from "../../src/utils/contracts";
import { defineSecret } from "firebase-functions/params";
import { memoize } from "../../src/utils/memoize";
import { DelphsTable } from "../../contracts/typechain";
import { WarriorStats } from "../../src/boardLogic/Warrior"
import { defaultInitialInventory } from "../../src/boardLogic/items";
import { FieldValue } from "firebase-admin/firestore";

const delphsPrivateKey = defineSecret("DELPHS_PRIVATE_KEY")

// const ONE = utils.parseEther('1')

const NUMBER_OF_ROUNDS = 10
const TABLE_SIZE = 8
const WOOTGUMP_MULTIPLIER = 24

const botSetup = isTestnet ? testnetBots : mainnetBots

enum TableStatus {
  UNSTARTED = 0,
  STARTED = 1,
  COMPLETE = 2,
  PAID = 3,
}


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

const walletAndContracts = memoize((delphsKey:string) => {
  functions.logger.debug("delphs private key")
  if (!delphsKey) {
    functions.logger.error("missing private key", process.env)
    throw new Error("must have a DELPHS private key")
  }
  const provider = skaleProvider

  const delphsWallet = new NonceManager(new Wallet(delphsKey).connect(provider))
  delphsWallet.getAddress().then((addr) => {
    console.log("Delph's address: ", addr)
  })

  const delphs = delphsContract("delphs", delphsWallet)
  const player = playerContract("delphs", delphsWallet)
  const delphsGump = delphsGumpContract("delphs", delphsWallet)

  return {
    delphs,
    player,
    delphsGump,
    delphsWallet
  }
})

export const onLobbyWrite = functions.runWith({ secrets: [delphsPrivateKey.name] }).firestore.document("/delphsLobby/{player}").onCreate(async (change, context) => {
  const { delphs, player, delphsGump, delphsWallet } = walletAndContracts(process.env[delphsPrivateKey.name]!)

  const playerUid = context.params.player
  if (!playerUid) {
    return
  }
  functions.logger.debug("write iniiated by", playerUid)

  // now let's create the table
  return db.runTransaction(async (transaction) => {
    // get all the players waiting
    const snapshot = await db.collection("/delphsLobby").get()
    const playerUids: string[] = []
    snapshot.forEach((doc) => {
      playerUids.push(doc.id)
    })

    const tableId = hashString(randomUUID())

    if (playerUids.length === 0) {
      return
    }

    functions.logger.debug("player uids: ", playerUids)

    const waiting = playerUids.map((uid) => uid.match(/w:(.+)/)![1])

    const botNumber = Math.max(10 - playerUids.length, 0)
    const id = tableId

    const addressToPlayerWithSeed = async (address: string, isBot: boolean) => {
      const [name, gump] = await Promise.all([
        player.name(address),
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
        owner: await delphsWallet.getAddress(),
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
      rounds: 15,
      wootgumpMultiplier: 15,
      round: 0,
      rolls: [],
      status: TableStatus.UNSTARTED,
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


async function _roller() {
  functions.logger.info('roller rolling')
  const { delphs } = walletAndContracts(process.env[delphsPrivateKey.name]!)
  await txSingleton.push(async () => {
    return delphs.rollTheDice()
  })
  const latest = await delphs.latestRoll()

  // find all unstarted tables
  const [snapshot, randomness] = await Promise.all([
    db.collection('/tables').where("status", "in", [TableStatus.UNSTARTED, TableStatus.STARTED, TableStatus.COMPLETE]).get(),
    delphs.rolls(latest)
  ])
  const promises:Promise<any>[] = []

  snapshot.forEach((doc) => {
    switch (doc.data().status) {
      case TableStatus.UNSTARTED:
        return promises.push(startTable(delphs, doc, {
          roll: latest.toNumber(),
          randomness,
        }))
      case TableStatus.STARTED:
        return promises.push(rollTable(delphs, doc, {
          roll: latest.toNumber(),
          randomness,
        }))
      case TableStatus.COMPLETE:
        return promises.push(completeTheTable(delphs, doc, {
          roll: latest.toNumber(),
          randomness,
        }))
      default:
        throw new Error("missing status: " + doc.data().status)
    }
    
  })
  return Promise.all(promises)
}

// emulators can't actually exec ever 10 seconds
export const roller = functions.runWith({secrets: [delphsPrivateKey.name]}).pubsub.schedule('every 10 seconds').onRun(_roller)
export const rollerTest = functions.runWith({secrets: [delphsPrivateKey.name] }).https.onRequest((req, resp) => {
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

async function startTable(delphs:DelphsTable, table: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>, roll: Roll) {
  functions.logger.info('starting table', table.id)
  const warriors:WarriorStats[] = await Promise.all(Object.values(table.data().seeds).map(async (seed:any) => {
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
  return db.doc(table.ref.path).update({
    warriors,
    status: TableStatus.STARTED,
    startRoll: roll
  })
}

async function rollTable(delphs:DelphsTable, table: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>, roll: Roll) {
  functions.logger.info('rolling table', table.id)
  const tableData = table.data()
  const updateDoc:any = {
    rolls: FieldValue.arrayUnion(roll),
    round: FieldValue.increment(1),
  }
  if ((tableData.rolls || []).length >= tableData.rounds) {
    updateDoc['status'] = TableStatus.COMPLETE
  } else {
    functions.logger.debug("rolls length: ", tableData.rolls.length, table.id)
  }

  return db.doc(table.ref.path).update(updateDoc)
}

async function completeTheTable(delphs:DelphsTable, table: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>, roll: Roll) {
  functions.logger.info('complete the table', table.id)
  // const tableData = table.data()
 
  return
}