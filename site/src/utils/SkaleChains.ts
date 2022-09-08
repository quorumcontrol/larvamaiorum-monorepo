import { Chain } from "@rainbow-me/rainbowkit";
import { isTestnet } from "./networks";

export const skaleTestnet: Chain = {
  id: 499161117,
  name: 'Skale Testnet',
  network: 'skaletestnet',
  iconUrl: '/SKALE_logo.svg',
  nativeCurrency: {
    decimals: 18,
    name: 'sFUEL',
    symbol: 'sFUEL',
  },
  rpcUrls: {
    default: 'https://staging-v2.skalenodes.com/v1/roasted-thankful-unukalhai',
    wss: 'wss://staging-v2.skalenodes.com/v1/ws/roasted-thankful-unukalhai',
  },
  blockExplorers: {
    default: { name: 'BlockScout', url: 'https://roasted-thankful-unukalhai.explorer.staging-v2.skalenodes.com/' },
  },
  testnet: true,
};

export const skaleMainnet: Chain = {
  id: 1032942172,
  name: 'Crypto Rome Network',
  network: 'cryptorome',
  iconUrl: '/SKALE_logo.svg',
  iconBackground: '#fff',
  nativeCurrency: {
    decimals: 18,
    name: 'sFUEL',
    symbol: 'sFUEL',
  },
  rpcUrls: {
    default: 'https://mainnet.skalenodes.com/v1/haunting-devoted-deneb',
    wss: 'wss://mainnet.skalenodes.com/v1/ws/haunting-devoted-deneb',
  },
  blockExplorers: {
    default: { name: 'BlockScout', url: 'https://haunting-devoted-deneb.explorer.mainnet.skalenodes.com/' },
  },
  testnet: false,
}

export function defaultNetwork() {
  return isTestnet ? skaleTestnet : skaleMainnet
}
