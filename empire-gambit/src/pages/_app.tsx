"use client"
import type { AppProps } from 'next/app'
import "@fontsource/cairo"
import "@fontsource/bebas-neue"
import { ChakraProvider } from '@chakra-ui/react'
import ethers, { BigNumber, providers } from "ethers"
import '@rainbow-me/rainbowkit/styles.css';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import {
  braveWallet,
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import {
  connectorsForWallets,
  darkTheme,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum } from 'wagmi/chains';
import { RainbowKitWalletWrapper, createChain } from '@skaleboarder/rainbowkit';
import { WagmiWrapper } from '@skaleboarder/wagmi';
import { fetchAddresses } from '@/utils/fetchAddresses';
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query'
import { DeployProvider } from '@/contexts/deploys';
import theme from '@/components/theme';
import { Web3AuthConnector } from "../utils/web3AuthConnector"
import { isLocalhost } from '@/utils/isLocalhost'
import { localFauct, powFauct } from '@/utils/faucets'

const skaleMainnet = createChain({
  id: BigNumber.from('0x3d91725c').toNumber(),
  name: 'Crypto Rome',
  rpcUrls: {
    default: {
      http: ["https://mainnet.skalenodes.com/v1/haunting-devoted-deneb"],
      webSocket: ["wss://mainnet.skalenodes.com/v1/ws/haunting-devoted-deneb"],
    },
    public: {
      http: ["https://mainnet.skalenodes.com/v1/haunting-devoted-deneb"],
      webSocket: ["wss://mainnet.skalenodes.com/v1/ws/haunting-devoted-deneb"],
    }
  },
  explorer: "https://haunting-devoted-deneb.explorer.mainnet.skalenodes.com/"
})

const localDev = createChain({
  id: 31337,
  name: 'Local Rome',
  rpcUrls: {
    default: {
      http: ['http://localhost:8545'],
    },
    public: {
      http: ['http://localhost:8545'],
    }
  },
  explorer: "http://no.explorer"
})

const skaleProvider = new providers.StaticJsonRpcProvider(isLocalhost() ? localDev.rpcUrls.default.http[0] : skaleMainnet.rpcUrls.default.http[0])

const addresses = isLocalhost() ? fetchAddresses("localhost") : fetchAddresses("skale")

const wrapperConfigs = {
  ethers,
  provider: skaleProvider,
  chainId: isLocalhost() ? localDev.id.toString() : skaleMainnet.id.toString(),
  deploys: addresses,
  faucet: isLocalhost() ? localFauct("localhost") : powFauct("skale")
}

const wrapper = new RainbowKitWalletWrapper(wrapperConfigs)

const { chains, provider } = configureChains(
  [mainnet, polygon, optimism, arbitrum, skaleMainnet],
  [
    jsonRpcProvider({
      rpc: (_chain) => ({
        http: skaleProvider.connection.url,
      }),
    }),
  ]
);

const connectors = () => {
  const connects = connectorsForWallets([
    {
      groupName: 'Recommended',
      wallets: [
        injectedWallet({ chains, shimDisconnect: true }),
        metaMaskWallet({ chains, shimDisconnect: true }),
        coinbaseWallet({ appName: "Empire Gambit", chains }),
        walletConnectWallet({ chains }),
        braveWallet({ chains, shimDisconnect: true }),
      ].map((wallet) => wrapper.wrapWallet(wallet)),
    },
  ])

  return connects().concat([
    new WagmiWrapper(wrapperConfigs).wrapConnector(new Web3AuthConnector({ chains: [mainnet], options: {} })),
  ])
}

const wagmiClient = createClient({
  autoConnect: true,
  connectors: connectors,
  provider
})

const queryClient = new QueryClient()

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider chains={chains} theme={darkTheme()}>
          <QueryClientProvider client={queryClient}>
            <DeployProvider value={addresses}>
              <Component {...pageProps} />
            </DeployProvider>
          </QueryClientProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </ChakraProvider>
  )
}
