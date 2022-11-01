import { randomUUID } from "crypto";
import { Wallet } from "ethers";
import { NonceManager } from '@ethersproject/experimental'
import * as functions from "firebase-functions";
import { db } from "./app"
import testnetBots from '../../contracts/bots-testnet'
import mainnetBots from '../../contracts/bots-mainnet'
// import { memoize } from "../../src/utils/memoize";
import { isTestnet } from '../../src/utils/networks'
import SingletonQueue from '../../src/utils/singletonQueue'
import { skaleProvider } from "../../src/utils/skaleProvider";

// const ONE = utils.parseEther('1')

// const NUMBER_OF_ROUNDS = 10
// const TABLE_SIZE = 8
// const WOOTGUMP_MULTIPLIER = 24

const botSetup = isTestnet ? testnetBots : mainnetBots

// // const PAYOUT_TRACKER = keccak256(Buffer.from('delphs-needs-payout'))

// // const SECONDS_BETWEEN_ROUNDS = 15
// // const STOP_MOVES_BUFFER = 4 // seconds before the next round to stop moves

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

if (!process.env.DELPHS_PRIVATE_KEY) {
  console.error('no private key')
  throw new Error("must have a DELPHS private key")
}

const txSingleton = new SingletonQueue()

const provider = skaleProvider

const delphsWallet = new NonceManager(new Wallet(process.env.DELPHS_PRIVATE_KEY).connect(provider))
delphsWallet.getAddress().then((addr) => {
  console.log("Delph's address: ", addr)
})


const lobby = lobbyContract("delphs", delphsWallet)
const delphs = delphsContract("delphs", delphsWallet)
const player = playerContract("delphs", delphsWallet)
const delphsGump = delphsGumpContract("delphs", delphsWallet)
const accolades = accoladesContract("delphs", delphsWallet)
const listKeeper = listKeeperContract("delphs", delphsWallet)

export const onLobbyWrite = functions.firestore.document("/delphsLobby/{player}").onCreate(async (change, context) => {
  functions.logger.debug("change", change)
  functions.logger.debug("context", context)

  const playerUid = context.params.player
  if (!playerUid) {
    return
  }

  // now let's create the table
  return db.runTransaction(async (transaction) => {
    // get all the players waiting
    const snapshot = await db.collection("/delphsLobby").get()
    const playerUids: string[] = []
    snapshot.forEach((doc) => {
      playerUids.push(doc.id)
    })

    const tableId = randomUUID()
    functions.logger.debug("all players", playerUids)
    const newDoc = db.doc(`/tables/${tableId}`)
    transaction.create(newDoc, {
      players: playerUids,
      rounds: 15,
      seed: 'todo',
      wootgumpMultiplier: 15,
      round: 0,
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
