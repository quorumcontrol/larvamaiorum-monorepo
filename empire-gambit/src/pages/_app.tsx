import type { AppProps } from 'next/app'
import "@fontsource/cairo"
import "@fontsource/bebas-neue"
import { CacheProvider } from '@chakra-ui/next-js'
import { ChakraProvider } from '@chakra-ui/react'
import ethers, { BigNumber, providers } from "ethers"
import '@rainbow-me/rainbowkit/styles.css';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import {
  braveWallet,
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import {
  connectorsForWallets,
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


const addresses = fetchAddresses("localhost")
console.log("addresses: ", addresses)

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
  explorer: "https://haunting-devoted-deneb.explorer.mainnet.skalenodes.com/"

})

const skaleProvider = new providers.StaticJsonRpcProvider("http://localhost:8545/")


const wrapperConfigs = {
  ethers,
  provider: skaleProvider,
  chainId: skaleMainnet.id.toString(),
  deploys: addresses,
  faucet: async (address:string) => {
    console.log("faucet called!", address)
    const resp = await fetch(`/api/localFaucet`, { body: JSON.stringify({ address }), method: "POST" })
    const json = await resp.json()
    console.log("resp: ", json)
  },
}

const wrapper = new RainbowKitWalletWrapper(wrapperConfigs)

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

const connectors = () => {
  const connects = connectorsForWallets([
    {
      groupName: 'Recommended',
      wallets: [
        injectedWallet({ chains, shimDisconnect: true }),
        metaMaskWallet({ chains, shimDisconnect: true }),
        coinbaseWallet({ appName: "Crypto Colosseum", chains }),
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
  autoConnect: false,
  connectors: connectors,
  provider
})

const queryClient = new QueryClient()

export default function App({ Component, pageProps }: AppProps) {
  return (
    <CacheProvider>
      <ChakraProvider theme={theme}>
        <WagmiConfig client={wagmiClient}>
          <RainbowKitProvider chains={chains}>
            <QueryClientProvider client={queryClient}>
              <DeployProvider value={addresses}>
                <Component {...pageProps} />
              </DeployProvider>
            </QueryClientProvider>
          </RainbowKitProvider>
        </WagmiConfig>
      </ChakraProvider>
    </CacheProvider>
  )
}
