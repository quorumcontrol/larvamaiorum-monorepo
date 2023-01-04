import { extendTheme, ChakraProvider } from "@chakra-ui/react"
import "@fontsource/cairo"
import "@fontsource/bebas-neue"
import "../styles/globals.css"
import type { AppProps } from "next/app"

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

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}
