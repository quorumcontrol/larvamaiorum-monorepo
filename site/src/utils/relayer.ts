import { Contract, PayableOverrides, PopulatedTransaction, Signer, Wallet } from 'ethers'
import KasumahRelayer from 'skale-relayer-contracts/lib/src/KasumahRelayer'
import { TrustedForwarder } from 'skale-relayer-contracts/lib/typechain-types'
import { delphsContract, lobbyContract, playerContract, trustedForwarderContract } from './contracts'
import { memoize } from './memoize'
import { skaleProvider } from './skaleProvider'
import { wrapContract } from 'kasumah-relay-wrapper'
import { bytesToSignForToken, createToken, PreTokenData, Token } from 'skale-relayer-contracts'
import EventEmitter from 'events'

const SESSION_EXPIRY = 43200
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
  forwarder: TrustedForwarder
  user:Signer

  address?:string

  private setupForTokenCreationPromise:Promise<any>

  private preTokenData?:PreTokenData

  get deviceWallet() {
    if (typeof window !== 'undefined' && window.localStorage) {
      return deviceWallet()
    }
    return undefined
  }

  constructor(user:Signer) {
    super()
    this.user = user
    this.user.getAddress().then((addr) => {
      this.address = addr
    })
    this.forwarder = trustedForwarderContract().connect(this.deviceWallet!)
    this.setupForTokenCreationPromise = this.setupForTokenCreation()
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

  waitForReady() {
    return this.setupForTokenCreationPromise
  }

  multisend(txs:PopulatedTransaction[], opts?:PayableOverrides) {
    if (!this.relayer) {
      throw new Error('no relayer')
    }
    return this.relayer.multisend(txs, opts || { gasLimit: 5_000_000 })
  }

  async setupForTokenCreation() {
    if (!this.deviceWallet) {
      throw new Error('missing device wallet')
    }
    this.preTokenData = await bytesToSignForToken(this.forwarder, this.user, this.deviceWallet, SESSION_EXPIRY)
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
    // await this.maybeGetFaucet()
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

}

export default RelayManager
