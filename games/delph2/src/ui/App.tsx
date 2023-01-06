import React from "react"
import { ChakraProvider, extendTheme, Text } from "@chakra-ui/react"
import { PlayCanvasApplicationProvider } from "./components/appProvider"
import { Global } from '@emotion/react'

const Fonts = () => (
  <Global
    styles={`
      /* latin */
      @font-face {
        font-family: 'Bebas Neue';
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: url('https://delphsart.s3.fr-par.scw.cloud/BebasNeue-Regular.ttf');
      }
      /* latin */
      @font-face {
        font-family: 'Cairo';
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: url('https://delphsart.s3.fr-par.scw.cloud/Cairo-Regular.ttf');
      }
      `}
  />
)

const theme = extendTheme({
  config: {
    initialColorMode: "dark",
  },
  styles: {
    global: {
      body: {
        fontSize: "22px",
        bg: "brand.background",
        fontWeight: "400",
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
      orange: "#D14509",
      accoladeBackground: "#1F1816",
    },
  },
  components: {
    Button: {
      variants: {
        primary: {
          textTransform: "uppercase",
          fontWeight: "700",
          bg: "brand.orange",
          borderRadius: "0",
        },
        secondary: {
          borderRadius: "0",
          textTransform: "uppercase",
          fontWeight: "700",
          background: "rgba(209, 69, 9, 0.05)",
          border: "1px solid rgba(233, 108, 55, 0.5)",
        },
      },
    },
    Heading: {
      baseStyle: {},
      sizes: {
        lg: {
          fontSize: "3xl",
          lineHeight: "50px",
          letterSpacing: "0.025em",
        },
        xl: {
          fontSize: "5xl",
          lineHeight: "80px",
          letterSpacing: "0.025em",
        },
        "2xl": {
          fontSize: "7xl",
          lineHeight: "99px",
          letterSpacing: "0.025em",
        },
      },
    },
  },
})

const App: React.FC<{app: pc.Application}> = ({ app }) => {
  return (
    <ChakraProvider theme={theme}>
      <Fonts />
      <PlayCanvasApplicationProvider value={app}>
        <Text>hello</Text>
      </PlayCanvasApplicationProvider>
    </ChakraProvider>
  )
}

export default App
