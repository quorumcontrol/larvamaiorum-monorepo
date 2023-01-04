import { Web3AuthCore } from "@web3auth/core"
import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from "@web3auth/base"
import { OpenloginAdapter } from "@web3auth/openlogin-adapter"

const web3auth = new Web3AuthCore({
  clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID!,
  chainConfig: {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: "0x1",
    rpcTarget: "https://rpc.ankr.com/eth",
  },
})

const openloginAdapter = new OpenloginAdapter({
  adapterSettings: {
    // clientId, //Optional - Provide only if you haven't provided it in the Web3Auth Instantiation Code
    // network: "cyan", // Optional - Provide only if you haven't provided it in the Web3Auth Instantiation Code
    uxMode: "popup",
    whiteLabel: {
      name: "Crypto Colosseum",
      logoLight: "https://cryptocolosseum.com/logo.svg",
      logoDark: "https://cryptocolosseum.com/logo.svg",
      defaultLanguage: "en",
      dark: true, // whether to enable dark mode. defaultValue: false
    },
  },
})

web3auth.configureAdapter(openloginAdapter)

class Web3AuthWrapper {

  private initPromise:ReturnType<Web3AuthCore['init']>

  constructor() {
    this.initPromise = web3auth.init()
  }

  waitForReady() {
    return this.initPromise
  }

  async connectTo(loginType:string) {
    await this.waitForReady()
    return web3auth.connectTo(WALLET_ADAPTERS.OPENLOGIN, {
      loginProvider: loginType,
    })
  }

}

export default new Web3AuthWrapper()
