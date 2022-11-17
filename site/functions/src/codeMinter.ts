import * as functions from "firebase-functions";
import "./app"
import SingletonQueue from "../../src/utils/singletonQueue"
import { defineSecret } from "firebase-functions/params";
import { delphsPrivateKey, walletAndContracts } from "./wallets";
import { keccak256 } from "ethers/lib/utils";
import { memoize } from "../../src/utils/memoize";
import { Wallet } from "ethers";
import { skaleProvider } from "../../src/utils/skaleProvider";
import { badgeOfAssemblyContract } from "../../src/utils/contracts";
import { NonceManager } from "@ethersproject/experimental";

const badgeMinterPrivateKey = defineSecret("BADGE_MINTER_PRIVATE_KEY")

const singleton = new SingletonQueue("faucet")

const badgeOfAssembly = memoize(async (minterPrivateKey: string) => {
  const wallet = new NonceManager(new Wallet(minterPrivateKey).connect(skaleProvider))
  return badgeOfAssemblyContract("minter", wallet)
})

export const codeMinter = functions
  .runWith({
    secrets: [
      delphsPrivateKey.name,
      badgeMinterPrivateKey.name,
    ],
    maxInstances: 1,
  })
  .https
  .onCall(async (data, _context) => {
    const [delph, badgeContract] = await Promise.all([
      walletAndContracts(process.env[delphsPrivateKey.name]!),
      badgeOfAssembly(process.env[badgeMinterPrivateKey.name]!)
    ])
    const { address, code, tokenId }: { address: string, code: string, tokenId: number } = data

    const list = keccak256(Buffer.from(`boa-${code}-${tokenId}`))
    const entry = keccak256(Buffer.from(address.toLowerCase()))

    const [alreadyMinted, maxSize, currentCount] = await Promise.all([
      delph.listKeeper.contains(list, entry),
      delph.listKeeper.listSize(list),
      delph.listKeeper.count(list),
    ])

    if (maxSize.eq(0)) {
      throw new functions.https.HttpsError("failed-precondition", "invalid code")
    }

    if (alreadyMinted || (currentCount.gte(maxSize))) {
      throw new functions.https.HttpsError("failed-precondition", "Code already used")
    }

    try {
      const tx = await singleton.push(async () => {
        try {
          functions.logger.debug("adding to list")
          await (await delph.listKeeper.add(list, entry, { gasLimit: 350_000 })).wait()
          functions.logger.debug("minting")
          const tx = await badgeContract.mint(address, tokenId, 1, { gasLimit: 1_000_000 })
          functions.logger.debug("coded badge", tokenId, "to", address, "txid: ", tx.hash)
          return tx
        } catch (err) {
          throw err
        }
      })

      return {
        address,
        transactionId: tx.hash
      }
    } catch (err: any) {
      functions.logger.error("error minting: ", err)
      throw new functions.https.HttpsError("unknown", "error minting", err)
    }
  })
