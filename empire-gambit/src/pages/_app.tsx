import type { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'
import ethers, { BigNumber, providers } from "ethers"
import '@rainbow-me/rainbowkit/styles.css';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import {
  injectedWallet,
  metaMaskWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import {
  connectorsForWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum } from 'wagmi/chains';
import { RainbowKitWalletWrapper, createChain } from '@skaleboarder/rainbowkit';
import addresses from "../contract-deployments/skale/addresses.json"


const skaleMainnet = createChain({
  id: BigNumber.from('0x3d91725c').toNumber(),
  name: 'Crypto Rome',
  rpcUrls: {
    default: {
      http: ['http://localhost:8545'],
    },
    public: {
      http: ['http://localhost:8545'],
    }
  },
  explorer: "https://haunting-devoted-deneb.explorer.mainnet.skalenodes.com/";

})

const skaleProvider = new providers.StaticJsonRpcProvider("http://localhost:8545/")

const wrapper = new RainbowKitWalletWrapper({
    ethers,
    provider: skaleProvider,
    chainId: skaleMainnet.id.toString(),
    deploys: addresses,
})

const { chains, provider } = configureChains(
  [mainnet, polygon, optimism, arbitrum],
  [
    jsonRpcProvider({
      rpc: (chain) => ({
        http: `http://localhost:8545`,
      }),
    }),
  ]
);

const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      injectedWallet({ chains }),
      metaMaskWallet({ chains }),
      walletConnectWallet({ chains }),
      // rainbowWallet({ chains }),
      // walletConnectWallet({ chains }),
      // coinbaseWallet({ appName: "Demo Skaleboarder", chains }),
    ].map((wallet) => wrapper.wrapWallet(wallet)),
  },
]);

const wagmiClient = createClient({
  autoConnect: false,
  connectors: connectors,
  provider
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider chains={chains}>
          <Component {...pageProps} />
        </RainbowKitProvider>
      </WagmiConfig>
    </ChakraProvider>
  )
}
