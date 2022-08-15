import type { AppProps } from "next/app";
import Head from "next/head";
import { extendTheme, ChakraProvider } from "@chakra-ui/react";
import "@fontsource/cairo";
import "@fontsource/bebas-neue";
import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
  Theme,
} from "@rainbow-me/rainbowkit";
import merge from 'lodash.merge'
import { configureChains, createClient, WagmiConfig, chain } from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { QueryClient, QueryClientProvider } from "react-query";
import Script from "next/script";
import { skaleTestnet, skaleMainnet } from "../src/utils/SkaleChains";
import "../styles/video-background.css";
import "video.js/dist/video-js.css";

const { chains, provider } = configureChains(
  [
    chain.mainnet,
    chain.ropsten,
    chain.rinkeby,
    chain.goerli,
    chain.kovan,
    chain.optimism,
    chain.optimismKovan,
    chain.polygon,
    chain.polygonMumbai,
    chain.arbitrum,
    chain.arbitrumRinkeby,
    chain.localhost,
    chain.hardhat,
    skaleTestnet,
    skaleMainnet,
  ],
  [
    jsonRpcProvider({
      rpc: (chain) => {
        switch (chain.id) {
          case skaleTestnet.id:
            return { http: chain.rpcUrls.default };
          case skaleMainnet.id:
            return { http: chain.rpcUrls.default };
          default:
            return {
              http: chain.rpcUrls.default,
            };
        }
      },
    }),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "Delph's Table",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

const theme = extendTheme({
  config: {
    initialColorMode: "dark",
  },
  styles: {
    global: {
      body: {
        fontSize: "22px",
        bg: "brand.background",
        fontWeight: '400',
      },
    },
  },
  fonts: {
    heading: "Bebas Neue, cursive",
    body: "Cairo, sans-serif",
  },
  colors: {
    brand: {
      background: "#101010",
      orange: '#D14509',
    },
  },
  components: {
    Button: {
      variants: {
        primary: {
          textTransform: 'uppercase',
          fontWeight: '700',
          bg: 'brand.orange'
        }
      }
    },
    Heading: {
      baseStyle: {
      },
      sizes: {
        xl: {
          fontSize: "5xl",
          lineHeight: '80px',
          letterSpacing: '0.025em',
        },
        '2xl': {
          fontSize: "7xl",
          lineHeight: '99px',
          letterSpacing: '0.025em',
        }
      }
    },
  },
});

const queryClient = new QueryClient();

const rainbowTheme = merge(darkTheme(), {
  colors: {
    accentColor: '#D14509',
  },
  fonts: {
    body: 'Cairo, sans-serif'
  },
  radii: {
    connectButton: '0px'
  }
} as Theme);

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider
          chains={chains}
          theme={rainbowTheme}
        >
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
                content="Welcome to Crypto Rome. Immerse yourself in wootgump infused struggle for power and glory."
              />
              <link rel="icon" href="/favicon.ico" />
              <meta
                property="og:title"
                content="Crypto Colosseum: Larva Maiorum"
                key="ogtitle"
              />
              <meta
                property="og:description"
                content="Welcome to Crypto Rome. Immerse yourself in wootgump infused struggle for power and glory."
                key="ogdesc"
              />

              <meta name="twitter:card" content="summary" key="twcard" />
              <meta
                name="twitter:creator"
                content="@larva_maiorum"
                key="twhandle"
              />

              <meta
                property="og:url"
                content="https://cryptocolosseum.com"
                key="ogurl"
              />
            </Head>
            <Script
              strategy="afterInteractive"
              src="https://www.googletagmanager.com/gtag/js?id=G-VF4GZ76QZK"
            />
            <Script
              id="gtag-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-VF4GZ76QZK', {
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
  );
}

export default MyApp;
