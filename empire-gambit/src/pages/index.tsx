import Layout from '@/components/Layout'
import { Box, Center, Heading, Stack, Text, VStack } from '@chakra-ui/react'
import Image from 'next/image'
import initializedLogo from "@/assets/partners/Initialized.png"
import gameTradeLogo from "@/assets/partners/GameTradeMarket.png"
import boostVCLogo from "@/assets/partners/BoostVC.png"
import iaVenturesLogo from "@/assets/partners/IAVentures.png"
import skaleLogo from "@/assets/partners/Skale.png"
import EmailSubscriptionForm from '@/components/EmailSubscriptionForm'

export default function Home() {
  return (
    <Layout>
      <VStack>
        <Box p={[2,5]} pb="5">
          <Center minH="600px">
            <VStack maxW={["90%", "60%"]}>
              <Heading textAlign={["left", "center"]}>
                a fast-paced, casual strategy game. built by AI.
              </Heading>
              <Text textAlign={["left", "center"]}>
                Empire Gambit is the ultimate fusion of an ancient strategy game and disruptive technology. Generative AI algorithms create a fun, dynamic, and immersive gameplay experience that changes every time you play.
              </Text>
              <EmailSubscriptionForm />
            </VStack>
          </Center>
        </Box>
        <VStack alignItems="center" spacing={[1, 4]} pt={[5,0]} bgColor={["black", "transparent"]} w="100vw">
          <Heading size={"lg"}>Our Partners</Heading>
          <Stack
            direction={["column", "row"]}
            spacing={[5, 4]}
          >
            <Box>
              <Image src={initializedLogo} alt="Initialized Capital logo" height="50" style={{objectFit: "contain"}} />
            </Box>
            <Box>

              <Image src={gameTradeLogo} alt="GameTrade Market logo" height="50" style={{objectFit: "contain"}} />
            </Box>

            <Box>

              <Image src={boostVCLogo} alt="Boost VC logo" height="50" style={{objectFit: "contain"}} />
            </Box>

            <Box>

              <Image src={iaVenturesLogo} alt="IA Ventures logo" height="50" style={{objectFit: "contain"}} />
            </Box>

            <Box>

              <Image src={skaleLogo} alt="SKALE logo" height="50" style={{objectFit: "contain"}} />
            </Box>

          </Stack>
        </VStack>
      </VStack>
    </Layout>
  )
}
