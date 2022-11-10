import { Chain } from "@rainbow-me/rainbowkit";
import { isTestnet } from "./networks";
import skaleAddresses from "./skaleAddresses";

export const skaleTestnet: Chain = {
  id: skaleAddresses.testnet.id,
  name: 'Skale Testnet',
  network: 'skaletestnet',
  iconUrl: '/SKALE_logo.svg',
  nativeCurrency: {
    decimals: 18,
    name: 'sFUEL',
    symbol: 'sFUEL',
  },
  rpcUrls: {
    default: skaleAddresses.testnet.default,
    wss: skaleAddresses.testnet.wss,
  },
  blockExplorers: {
    default: { name: 'BlockScout', url: skaleAddresses.testnet.explorer },
  },
  testnet: true,
};

export const skaleMainnet: Chain = {
  id: skaleAddresses.mainnet.id,
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
    default: skaleAddresses.mainnet.default,
    wss: skaleAddresses.mainnet.wss,
  },
  blockExplorers: {
    default: { name: 'BlockScout', url: skaleAddresses.mainnet.explorer },
  },
  testnet: false,
}

export function defaultNetwork() {
  return isTestnet ? skaleTestnet : skaleMainnet
}
