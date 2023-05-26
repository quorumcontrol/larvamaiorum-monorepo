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
import CustomSupabaseContext from '@/contexts/CustomSupabaseContext'
import { MultiCaller } from '@skaleboarder/safe-tools'
import Head from 'next/head'

const skaleMainnet = createChain({
  id: 1032942172,
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

const getProvider = () => {
  const provider = new providers.StaticJsonRpcProvider(isLocalhost() ? localDev.rpcUrls.default.http[0] : skaleMainnet.rpcUrls.default.http[0])
  const multicaller = new MultiCaller(provider, {
    delay: 16,
  })
  return multicaller.wrappedProvider()
}

const skaleProvider = getProvider()

const addresses = isLocalhost() ? fetchAddresses("localhost") : fetchAddresses("skale")
console.log("addresses: ", addresses)

const wrapperConfigs = {
  ethers,
  provider: skaleProvider,
  chainId: isLocalhost() ? localDev.id.toString() : skaleMainnet.id.toString(),
  faucet: isLocalhost() ? localFauct("localhost") : powFauct("skale"),
  signerOptions: {
    multicall: true,
  }
}

const wrapper = new RainbowKitWalletWrapper(wrapperConfigs)

const { chains, provider } = configureChains(
  [mainnet, polygon, optimism, arbitrum, skaleMainnet],
  [
    jsonRpcProvider({
      rpc: (_chain) => ({
        http: isLocalhost() ? localDev.rpcUrls.default.http[0] : skaleMainnet.rpcUrls.default.http[0]
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

// well frack, I think we need to create a new context that allows for the
// setting of the authorization header with a jwt.

// see: https://github.com/supabase/gotrue-js/pull/340#issuecomment-1218065610
export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head> 
        <link rel="icon" type="image/png" href="/favicon.png" />
      </Head>
      <ChakraProvider theme={theme}>
        <WagmiConfig client={wagmiClient}>
          <RainbowKitProvider chains={chains} theme={darkTheme()}>
            <QueryClientProvider client={queryClient}>
              <DeployProvider value={addresses}>
                <CustomSupabaseContext pageProps={pageProps}>
                  <Component {...pageProps} />
                </CustomSupabaseContext>
              </DeployProvider>
            </QueryClientProvider>
          </RainbowKitProvider>
        </WagmiConfig>
      </ChakraProvider>
    </>
  )
}
