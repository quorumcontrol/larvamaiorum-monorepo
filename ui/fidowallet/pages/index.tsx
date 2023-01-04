import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react"
import { SocialIcon } from "react-social-icons"
import fetch from "cross-fetch"
import { startAuthentication, startRegistration } from "@simplewebauthn/browser"
import { Web3AuthCore } from "@web3auth/core"
import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from "@web3auth/base"
import { OpenloginAdapter } from "@web3auth/openlogin-adapter"
import { providers } from "ethers"
import { useEffect } from "react"

const web3auth = new Web3AuthCore({
  clientId: "BKqcQg-gPiCwJjvG9hiLLaEaZr22ggXuSORxWQRVwHHHlFl_WSpmpZmqI4KisdRAwRl_1RGVx-S6udEcH4LTXYs",
  chainConfig: {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: "0x1",
    rpcTarget: "https://rpc.ankr.com/eth", // This is the mainnet RPC we have added, please pass on your own endpoint while creating an app
  },
  // uiConfig: {
  //   theme: "dark",
  //   loginMethodsOrder: ["google", "discord", "facebook", "reddit", "twitter"],
  //   appLogo: "https://web3auth.io/images/w3a-L-Favicon-1.svg", // Your App Logo Here
  //   defaultLanguage: "en",
  //   modalZIndex: "99998",
  // },
})

const openloginAdapter = new OpenloginAdapter({
  adapterSettings: {
    // clientId, //Optional - Provide only if you haven't provided it in the Web3Auth Instantiation Code
    // network: "cyan", // Optional - Provide only if you haven't provided it in the Web3Auth Instantiation Code
    uxMode: "popup",
    whiteLabel: {
      name: "Delph's Table",
      logoLight: "https://web3auth.io/images/w3a-L-Favicon-1.svg",
      logoDark: "https://web3auth.io/images/w3a-D-Favicon-1.svg",
      defaultLanguage: "en",
      dark: true, // whether to enable dark mode. defaultValue: false
    },
  },
})

web3auth.configureAdapter(openloginAdapter)


export default function Home() {
  useEffect(() => {
    web3auth.init()
  }, [])

  const onClick = async () => {
    // const resp = await web3auth.connectTo(WALLET_ADAPTERS.OPENLOGIN, {
    //   loginProvider: "google",
    // })
    // console.log("resp", resp)

    console.log("adapter: ", await web3auth.getUserInfo())
    console.log("provider: ", web3auth.provider)
    const prov = new providers.Web3Provider(web3auth.provider as any, 'any')
    console.log(await prov.getBlockNumber())
    console.log("signer: ", prov.getSigner())
    console.log(await prov.getSigner().signMessage("bob"))
  }
  // const onClick = async () => {
  //   const resp = await fetch("/api/fido-start")
  //   const options = await resp.json()
  //   console.log("options: ", options)
  //   navigator.credentials.get({publicKey: { challenge: Buffer.from(options.challenge, 'base64') }})
  //     .then((resp) => console.log("browser", resp))
  //     .catch((err) => console.error("browser err: ", err))
  // }

  return (
    <>
      <Box position="absolute" top="0" left="0" zIndex={-1} />
      <Container p={10} maxW="1400" zIndex={1}>
        <VStack mt="10" spacing={5} alignItems="left">
          <Heading>Delph&apos;s Table</Heading>
          <Box>
            <div
              dangerouslySetInnerHTML={{
                __html: `<input type="text" name="username" autoComplete="webauthn username" autocomplete="webauthn username">`,
              }}
            ></div>

            {/* <Input type="text" autoComplete='webauthn' name='username'/> */}
            <Button onClick={onClick}>Sign in</Button>
          </Box>
        </VStack>
        <VStack as="footer" mt="200" textAlign="center" alignItems="center">
          <HStack>
            <SocialIcon url="https://twitter.com/larva_maiorum" />
            <SocialIcon url="https://discord.gg/tTSNvAuK" />
            <SocialIcon url="https://t.me/crypto_colosseum" />
          </HStack>
          <Text fontSize="sm">
            A Crypto Colosseum: Larva Maiorum experience.
          </Text>
          <Text pt="4" fontSize="12px">
            &copy; 2023 Quorum Control GmbH
          </Text>
        </VStack>
      </Container>
    </>
  )
}
