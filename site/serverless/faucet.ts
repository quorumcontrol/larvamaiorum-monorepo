
import { providers, utils, Wallet } from "ethers";
import { defaultNetwork } from '../src/utils/SkaleChains'
import debug from 'debug'
import { badgeOfAssemblyContract, trustedForwarderContract } from "../src/utils/contracts";
import SingletonQueue from '../src/utils/singletonQueue'
import { NonceManager } from "@ethersproject/experimental";
import { skaleProvider } from "../src/utils/skaleProvider";
import { isTestnet } from '../src/utils/networks'

const TESTNET_BOA = "0x881256ada5dD7CcB2457226C4bC978B067daF70B";
const MAINNET_BOA = "0x2C6FD25071Fd516947682f710f6e9F5eD610207F";

export const BOA_ADDRESS = isTestnet ? TESTNET_BOA : MAINNET_BOA

const singletonQueue = new SingletonQueue()

const log = debug('faucet')
debug.enable('*')

if (!process.env.env_delphsPrivateKey) {
  throw new Error("must have a DELPHS private key")
}

const schainSigner = new NonceManager(new Wallet(process.env.env_delphsPrivateKey).connect(skaleProvider))

const badgeOfAssembly = badgeOfAssemblyContract()
const trustedForwarder = trustedForwarderContract()

const highWaterForSFuel = utils.parseEther('1')

export async function handle(event: any, context: any, callback: any) {
  const { relayerAddress, userAddress, token, issuedAt } = JSON.parse(event.body)

  // first get the balances
  const [relayerBalance, badgeTokens, isVerified] = await Promise.all([
    skaleProvider.getBalance(relayerAddress),
    badgeOfAssembly.userTokens(userAddress),
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

  log(userAddress, 'relayerAddres', relayerAddress, 'sfuel (relayer): ', utils.formatEther(relayerBalance), 'badges: ', badgeTokens.length, 'relayer balance: ', utils.formatEther(relayerBalance))

  if (badgeTokens.length === 0) {
    log(userAddress, 'no badge')
    return callback(null, {
      statusCode: 400,
      body: JSON.stringify({
        message: 'requires badge',
        input: event,
      }),
    })
  }

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