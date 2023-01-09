import type { AppProps } from "next/app"
import Head from "next/head"
import { ChakraProvider } from "@chakra-ui/react"
import "@fontsource/cairo"
import "@fontsource/bebas-neue"
import "@rainbow-me/rainbowkit/styles.css"
import {
  RainbowKitProvider,
  darkTheme,
  Theme,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit"
import {
  braveWallet,
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import merge from "lodash.merge"
import { configureChains, createClient, WagmiConfig, chain } from "wagmi"
import { jsonRpcProvider } from "wagmi/providers/jsonRpc"
import { QueryClient, QueryClientProvider } from "react-query"
import Script from "next/script"
import { skaleTestnet, skaleMainnet } from "../src/utils/SkaleChains"
import "../src/utils/firebase"
import "../styles/video-background.css"
import "video.js/dist/video-js.css"
import { Web3AuthConnector } from "../src/utils/web3AuthConnector"
import theme from "../src/shared/theme"

const { chains, provider } = configureChains(
  [
    skaleMainnet,
    chain.mainnet,
    chain.polygon,
    chain.optimism,
    chain.polygonMumbai,
    chain.arbitrum,
    chain.localhost,
    chain.hardhat,
    skaleTestnet,
  ],
  [
    jsonRpcProvider({
      rpc: (chain) => {
        switch (chain.id) {
          case skaleTestnet.id:
            return { http: chain.rpcUrls.default }
          case skaleMainnet.id:
            return { http: chain.rpcUrls.default }
          default:
            return {
              http: chain.rpcUrls.default,
            }
        }
      },
    }),
  ]
)

const connectors = () => {
  const connects = connectorsForWallets([
    {
      groupName: 'Recommended',
      wallets: [
        injectedWallet({ chains, shimDisconnect: true }),
        metaMaskWallet({ chains, shimDisconnect: true }),
        coinbaseWallet({ appName: "Crypto Colosseum", chains }),
        walletConnectWallet({ chains }),
        braveWallet({ chains, shimDisconnect: true}),
        rainbowWallet({ chains }),
      ],
    },
  ])

  return connects().concat([
    new Web3AuthConnector({ chains: [chain.mainnet], options: {} }),
  ])
}

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
})

const queryClient = new QueryClient()

const rainbowTheme = merge(darkTheme(), {
  colors: {
    accentColor: "#D14509",
  },
  fonts: {
    body: "Cairo, sans-serif",
  },
  radii: {
    connectButton: "0px",
  },
} as Theme)

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider chains={chains} theme={rainbowTheme}>
          <ChakraProvider theme={theme}>
            <Head>
              <title>Crypto Colosseum: Larva Maiorum</title>
              <meta charSet="utf-8" />
              <meta
                name="viewport"
                content="width=device-width, initial-scale=1"
              />
              <meta
                property="og:site_name"
                content="Crypto Colosseum: Larva Maiorum"
                key="ogsitename"
              />
              <link rel="icon" href="/favicon.ico" />
              <meta
                name="description"
                content="Welcome to Crypto Rome. Immerse yourself in a wootgump infused struggle for power and glory."
              />
              <link rel="icon" href="/favicon.ico" />
              <meta
                property="og:title"
                content="Crypto Colosseum: Larva Maiorum"
                key="ogtitle"
              />
              <meta
                property="og:description"
                content="Welcome to Crypto Rome. Immerse yourself in a wootgump infused struggle for power and glory."
                key="ogdesc"
              />

              <meta name="twitter:card" content="summary" key="twcard" />
              <meta
                name="twitter:creator"
                content="@larva_maiorum"
                key="twhandle"
              />

              <meta
                property="og:image:alt"
                content="A 3D rendered gladiator holding an axe standing next to fire."
                key="og:image:alt"
              />

              <meta
                property="og:url"
                content="https://cryptocolosseum.com"
                key="ogurl"
              />

              <meta
                property="og:image"
                content="/socialThumbnail.png"
                key="ogimage"
              />
            </Head>
            <Script
              strategy="afterInteractive"
              src="https://www.googletagmanager.com/gtag/js?id=G-350CR0X5ZH"
            />
            <Script
              id="gtag-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-350CR0X5ZH', {
              page_path: window.location.pathname,
            });
          `,
              }}
            />
            <Component {...pageProps} />
          </ChakraProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </QueryClientProvider>
  )
}

export default MyApp
