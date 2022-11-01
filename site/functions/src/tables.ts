import { randomUUID } from "crypto";
import { Wallet } from "ethers";
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
import { defineString } from "firebase-functions/params";
import { memoize } from "../../src/utils/memoize";

const delphsPrivateKey = defineString("DELPHS_PRIVATE_KEY")

// const ONE = utils.parseEther('1')

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

const walletAndContracts = memoize(() => {
  functions.logger.debug("delphs private key")
  if (!delphsPrivateKey.value()) {
    console.error('no private key')
    throw new Error("must have a DELPHS private key")
  }
  const provider = skaleProvider

  const delphsWallet = new NonceManager(new Wallet(delphsPrivateKey.value()).connect(provider))
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



export const onLobbyWrite = functions.firestore.document("/delphsLobby/{player}").onCreate(async (change, context) => {
  const { delphs, player, delphsGump, delphsWallet } = walletAndContracts()

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

    if (playerUids.length === 0) {
      return
    }

    const waiting = playerUids.map((uid) => uid.match(/w:($1)/)![1])

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
      functions.logger.debug('doing orchestrator state add', { tableId })
      return startTx
    })
    functions.logger.debug('waiting for create and start', { tableId })
    await tx.wait()

    functions.logger.debug("all players", { tableId, playerUids })
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
