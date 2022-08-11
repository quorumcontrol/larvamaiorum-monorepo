import { Contract, Signer, utils, Wallet } from 'ethers'
import KasumahRelayer from 'skale-relayer-contracts/lib/src/KasumahRelayer'
import { TrustedForwarder } from 'skale-relayer-contracts/lib/typechain-types'
import { delphsContract, lobbyContract, playerContract, trustedForwarderContract } from './contracts'
import { memoize } from './memoize'
import { skaleProvider } from './skaleProvider'
import { wrapContract } from 'kasumah-relay-wrapper'
import { bytesToSignForToken, createToken, PreTokenData, Token } from 'skale-relayer-contracts'
import EventEmitter from 'events'
import { backOff } from 'exponential-backoff'

const FAUCET_URL =
  "https://delphsfaucetd3cqn3r9-faucet.functions.fnc.fr-par.scw.cloud";

const thresholdForFaucet = utils.parseEther("0.25");

const DEVICE_PK_KEY = "delphs:relayerKey"

const deviceWallet = memoize(() => {
  const storedKey = localStorage.getItem(DEVICE_PK_KEY)
  if (storedKey) {
    return new Wallet(storedKey).connect(skaleProvider)
  }
  const wallet = Wallet.createRandom()
  localStorage.setItem(DEVICE_PK_KEY, wallet.privateKey)
  return wallet.connect(skaleProvider)
})

class RelayManager extends EventEmitter {
  deviceToken?: Token
  relayer?: KasumahRelayer
  forwarder?: TrustedForwarder
  user?:Signer

  private preTokenData?:PreTokenData

  get deviceWallet() {
    if (typeof window !== 'undefined' && window.localStorage) {
      return deviceWallet()
    }
    return undefined
  }

  wrapped = {
    player: memoize(() => {
      return this.wrap(playerContract())
    }),
    lobby: memoize(() => {
      return this.wrap(lobbyContract())
    }),
    delphsTable: memoize(() => {
      return this.wrap(delphsContract())
    })
  }

  async setupForTokenCreation(user: Signer) {
    if (this.user && this.user === user) {
      console.log('setup for token creation called twice')
      return // we are already doing this with a user
    }
    this.user = user
    this.forwarder = trustedForwarderContract().connect(this.deviceWallet!)

    if (!this.deviceWallet) {
      throw new Error('missing device wallet')
    }
    this.preTokenData = await bytesToSignForToken(this.forwarder, user, this.deviceWallet)
    this.emit('readyForTokenCreation')
    return this.preTokenData
  }

  async createToken() {
    if (!this.preTokenData || !this.user) {
      throw new Error('you must have setup the pret token data to call createToken')
    }
    const token = await createToken(this.preTokenData, this.user)
    return this.setToken(token, this.user)
  }

  private async setToken(token: Token, user: Signer) {
    if (!this.forwarder) {
      throw new Error('missing forwarder')
    }
    this.deviceToken = token
    this.relayer = new KasumahRelayer(this.forwarder, this.deviceWallet!, user, token)
    await this.maybeGetFaucet()
    this.emit('ready')
  }

  canCreateToken() {
    return !!this.preTokenData
  }

  ready() {
    return !!this.deviceToken && !!this.relayer
  }

  wrap<T>(contract: T) {
    if (!this.relayer) {
      throw new Error('wrapping before ready')
    }
    return wrapContract<T>((contract as unknown as Contract).connect(this.deviceWallet!), this.relayer)
  }

  private async maybeGetFaucet() {
    if (!this.deviceWallet || !this.user || !this.deviceToken) {
      throw new Error("cannot get faucet without wallet or user")
    }
    const [address, balance] = await Promise.all([
      this.user.getAddress(),
      this.deviceWallet.getBalance()
    ])

    if (balance.lte(thresholdForFaucet)) {
      const resp = await fetch(FAUCET_URL, {
        body: JSON.stringify({ userAddress: address, relayerAddress: this.deviceWallet.address, issuedAt: this.deviceToken.issuedAt, token: this.deviceToken!.signature }),
        method: "post",
      });
      if (![200, 201].includes(resp.status)) {
        console.error("bad response from faucet: ", resp.status);
        throw new Error(`Bad response: ${resp.status} ${JSON.stringify(resp.json())}`);
      }
      const hash: string | undefined = (await resp.json()).transactionId;
      console.log("received: ", hash);

      if (hash) {
        console.log("waiting on: ", hash);
        const tx = await backOff(
          async () => {
            const tx = await skaleProvider.getTransaction(hash);
            console.log('tx inside backof: ', tx)
            return tx
          },
          {
            startingDelay: 500,
            maxDelay: 1000,
            numOfAttempts: 10,
          }
        );
        if (!tx) {
          throw new Error("missing tx");
        }
        await tx.wait();
      }
    }
  }

}

const manager = new RelayManager()

export default manager
