import { isTestnet } from "./networks"

const skaleAddresses = {
  testnet: {
    id: 499161117,
    default: 'https://staging-v2.skalenodes.com/v1/roasted-thankful-unukalhai',
    wss: 'wss://staging-v2.skalenodes.com/v1/ws/roasted-thankful-unukalhai',
    explorer: "https://roasted-thankful-unukalhai.explorer.staging-v2.skalenodes.com/",
  },
  mainnet: {
    id: 1032942172,
    default: 'https://mainnet.skalenodes.com/v1/haunting-devoted-deneb',
    wss: 'wss://mainnet.skalenodes.com/v1/ws/haunting-devoted-deneb',
    explorer: 'https://haunting-devoted-deneb.explorer.mainnet.skalenodes.com/',
  }
}

export function defaultNetwork() {
  return isTestnet ? skaleAddresses.testnet : skaleAddresses.mainnet
}

export default skaleAddresses