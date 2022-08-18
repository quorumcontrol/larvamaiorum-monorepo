
import { providers, utils, Wallet } from "ethers";
import debug from 'debug'
import { trustedForwarderContract } from "../src/utils/contracts";
import SingletonQueue from '../src/utils/singletonQueue'
import { NonceManager } from "@ethersproject/experimental";
import { skaleProvider } from "../src/utils/skaleProvider";

const singletonQueue = new SingletonQueue()

const log = debug('faucet')
debug.enable('*')

if (!process.env.FAUCET_PRIVATE_KEY) {
  throw new Error("must have a FAUCET_PRIVATE_KEY")
}

const schainSigner = new NonceManager(new Wallet(process.env.FAUCET_PRIVATE_KEY).connect(skaleProvider))

const trustedForwarder = trustedForwarderContract()

const highWaterForSFuel = utils.parseEther('1')

export async function handle(event: any, context: any, callback: any) {
  const { relayerAddress, userAddress, token, issuedAt } = JSON.parse(event.body)

  // first get the balances
  const [relayerBalance, isVerified] = await Promise.all([
    skaleProvider.getBalance(relayerAddress),
    trustedForwarder.verify(userAddress, relayerAddress, issuedAt, token)
  ])

  if (!isVerified) {
    return callback(null, {
      statusCode: 400,
      body: JSON.stringify({
        message: 'invalid token',
        input: event,
      }),
    })
  }

  log(userAddress, 'relayerAddres', relayerAddress, 'sfuel (relayer): ', utils.formatEther(relayerBalance), 'badges: ', 'relayer balance: ', utils.formatEther(relayerBalance))

  if (relayerBalance.gte(highWaterForSFuel)) {
    log(relayerAddress, 'relayer has enough sfuel')
    return callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        message: 'you have enough',
        input: event,
      }),
    })
  }

  singletonQueue.push(async () => {
    try {
      let tx: providers.TransactionResponse
      log('sending sfuel')
      try {
        tx = await schainSigner.sendTransaction({
          to: relayerAddress,
          value: highWaterForSFuel,
        })
      } catch (err) {
        console.error('error: ', err)
        return callback(null, {
          statusCode: 500,
          body: JSON.stringify({
            message: (err as any).toString(),
            input: event,
          }),
        })
      }

      log(userAddress, relayerAddress, 'tx submitted: ', tx.hash)

      return callback(null, {
        statusCode: 201,
        body: JSON.stringify({
          message: 'ok',
          transactionId: tx.hash,
        }),
      })
    } catch (err) {
      console.error('error sending transaction or doing callback: ', err)
      process.exit(1) // the simplest way to restore the nonce manager is to exit
    }
  })
}
