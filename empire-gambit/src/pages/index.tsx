import Layout from '@/components/Layout'
import { Box, Center, Heading, Icon, Stack, Text, VStack } from '@chakra-ui/react'
import Image from 'next/image'
import initializedLogo from "@/assets/partners/Initialized.png"
import gameTradeLogo from "@/assets/partners/GameTradeMarket.png"
import boostVCLogo from "@/assets/partners/BoostVC.png"
import iaVenturesLogo from "@/assets/partners/IAVentures.png"
import skaleLogo from "@/assets/partners/Skale.png"
import EmailSubscriptionForm from '@/components/EmailSubscriptionForm'
import { useCallback, useEffect, useRef, useState } from 'react'
import { TbPlayerPlayFilled } from "react-icons/tb"

export default function Home() {
  const [playing, setPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const onClick = () => {
    console.log('click')
    if (!videoRef.current) {
      console.log("nope")
      return
    }
    setPlaying(true)
    videoRef.current.play()
  }

  useEffect(() => {
    if (!videoRef.current) {
      return
    }
    videoRef.current.addEventListener('ended', () => {
      setPlaying(false)
    })
  }, [videoRef])

  return (
    <Layout>
      <VStack>
        <Box p="0" pb="5">
          <Center minH="600px">
            <VStack maxW={["90%", "60%"]}>
              <Box
                w="256px"
                h="256px"
                position="relative"
                display="table"
              >
                <video ref={videoRef} width="100%" height="100%" style={{ borderRadius: "100%" }}>
                  <source src="/minerva_sm.mp4" type="video/mp4" />
                </video>
                {!playing && (
                  <Box
                    position={"absolute"}
                    boxSize="64px"
                    margin="auto"
                    top="0"
                    left="0"
                    right="0"
                    bottom="0"
                    onClick={onClick}
                  >
                    <Icon as={TbPlayerPlayFilled}
                      boxSize="100%"
                    />
                  </Box>
                )}


              </Box>
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
        <VStack alignItems="center" spacing={[1, 4]} py={[5, 0]} bgColor={["black", "transparent"]} w="100vw">
          <Heading size={"lg"}>Our Partners</Heading>
          <Stack
            direction={["column", "row"]}
            spacing={[5, 4]}
          >
            <Box>
              <Image src={initializedLogo} alt="Initialized Capital logo" height="50" style={{ objectFit: "contain" }} />
            </Box>
            <Box>

              <Image src={gameTradeLogo} alt="GameTrade Market logo" height="50" style={{ objectFit: "contain" }} />
            </Box>

            <Box>

              <Image src={boostVCLogo} alt="Boost VC logo" height="50" style={{ objectFit: "contain" }} />
            </Box>

            <Box>

              <Image src={iaVenturesLogo} alt="IA Ventures logo" height="50" style={{ objectFit: "contain" }} />
            </Box>

            <Box>

              <Image src={skaleLogo} alt="SKALE logo" height="50" style={{ objectFit: "contain" }} />
            </Box>

          </Stack>
        </VStack>
      </VStack>
    </Layout>
  )
}
