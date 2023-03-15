import Layout from '@/components/Layout'
import { Box, Center, Heading, Stack, Text, VStack } from '@chakra-ui/react'
import landingPageBackground from "@/assets/landingPageBackground.png"
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
        <Box backgroundImage={landingPageBackground.src} p="12">
          <Center h="600px">
            <VStack maxW="64%">
              <Heading>
                fast-paced, casual strategy game built by AI.
              </Heading>
              <Text textAlign="center">
                Experience the ultimate fusion of ancient strategy and disruptive technology with Empire Gambit. The game is built using state-of-the-art AI algorithms that create a dynamic and immersive gameplay experience.
              </Text>
              <EmailSubscriptionForm />
            </VStack>
          </Center>
        </Box>
        <VStack alignItems="center" spacing={[1, 4]}>
          <Heading size={"lg"}>Our Partners</Heading>
          <Stack
            direction={["column", "row"]}
            spacing={[1, 4]}
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
