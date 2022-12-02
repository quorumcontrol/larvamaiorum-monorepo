import * as functions from "firebase-functions";
import "./app"
import { TrustedForwarder__factory } from "skale-relayer-contracts/lib/typechain-types";
import SingletonQueue from "../../src/utils/singletonQueue"
import { addresses } from "../../src/utils/networks";
import { skaleProvider } from "../../src/utils/skaleProvider"
import { defineSecret } from "firebase-functions/params";
import { providers, utils, Wallet } from "ethers";
import { NonceManager } from "@ethersproject/experimental";
import { memoize } from "../../src/utils/memoize";

const SESSION_EXPIRY = 43200

const faucetPrivateKey = defineSecret("FAUCET_PRIVATE_KEY")

const highWaterForSFuel = utils.parseEther("0.05")

const trustedForwarder = TrustedForwarder__factory.connect(addresses().TrustedForwarder, skaleProvider)

const singletonQueue = new SingletonQueue("faucet")

const subFaucet = memoize(async (faucetKey: string) => {
  const mainFaucet = new Wallet(faucetKey).connect(skaleProvider)
  const subFaucet = Wallet.createRandom().connect(skaleProvider)
  const tx = await mainFaucet.sendTransaction({
    to: subFaucet.address,
    value: highWaterForSFuel.mul(100),
  })
  await tx.wait()
  functions.logger.info("funded the sub faucet", tx.hash)

  return new NonceManager(subFaucet)
})

export const faucet = functions
  .runWith({ secrets: [faucetPrivateKey.name] })
  .https
  .onCall(async (data, _context) => {
    const { relayerAddress, userAddress, token, issuedAt } = data
    const subWallet = await subFaucet(process.env[faucetPrivateKey.name]!)
    // first get the balances
    const [relayerBalance, isVerified] = await Promise.all([
      skaleProvider.getBalance(relayerAddress),
      trustedForwarder.verify(userAddress, relayerAddress, issuedAt, SESSION_EXPIRY, token)
    ])

    if (!isVerified) {
      throw new functions.https.HttpsError("unauthenticated", "invalid token")
    }

    functions.logger.info(userAddress, "relayerAddres", relayerAddress, "sfuel (relayer): ", utils.formatEther(relayerBalance), "badges: ", "relayer balance: ", utils.formatEther(relayerBalance))

    if (relayerBalance.gte(highWaterForSFuel)) {
      functions.logger.info(relayerAddress, "relayer has enough sfuel")
      return {
        message: "you have enough",
      }
    }

    return singletonQueue.push(async () => {
      try {
        let tx: providers.TransactionResponse
        functions.logger.debug("sending sfuel")
        try {
          tx = await subWallet.sendTransaction({
            to: relayerAddress,
            value: highWaterForSFuel,
          })
        } catch (err) {
          functions.logger.error("error: ", err)
          // here let"s check if the subwallet still has sfuel
          const bal = await subWallet.getBalance()
          if (bal.lte(highWaterForSFuel.mul(2))) {
            functions.logger.error("exiting due to low balance", utils.formatEther(bal))
            // just exit for now, this will get another one fueled up
            process.exit(1)
          }
          throw new functions.https.HttpsError("unknown", "unknown transaction error", err)
        }

        functions.logger.info(userAddress, relayerAddress, "tx submitted: ", tx.hash)

        return {
          message: "ok",
          transactionId: tx.hash,
        }
      } catch (err) {
        functions.logger.error("error sending transaction or doing callback: ", err)
        process.exit(1) // the simplest way to restore the nonce manager is to exit
      }
    })
  })

