import Layout from '@/components/Layout'
import { Box, Button, Center, Divider, Fade, Heading, Icon, SlideFade, Spacer, Stack, Text, VStack } from '@chakra-ui/react'
import Image from 'next/image'
import initializedLogo from "@/assets/partners/Initialized.png"
import gameTradeLogo from "@/assets/partners/GameTradeMarket.png"
import boostVCLogo from "@/assets/partners/BoostVC.png"
import iaVenturesLogo from "@/assets/partners/IAVentures.png"
import skaleLogo from "@/assets/partners/Skale.png"
import EmailSubscriptionForm from '@/components/EmailSubscriptionForm'
import { useCallback, useEffect, useRef, useState } from 'react'
import { TbPlayerPlayFilled } from "react-icons/tb"
import MinervaText from '@/components/minerva/MinervaText'
import { PageEffects } from '@/components/minerva/PageEffects'
import Head from 'next/head'
import { Link } from '@chakra-ui/next-js'

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
    <>
      <Layout>
        <VStack spacing="100px" zIndex="1">

          <Stack direction={["column", "row"]} spacing="5" alignItems="center" minW="500px">
            <Box w="md">
              <SlideFade in={true} transition={{ enter: { duration: 0.5, ease: "easeInOut" } }} reverse offsetY="-30px">
                <Heading>
                  a fast-paced, casual strategy game.<br /><Box as="span" color="brand.orange">built by AI.</Box>
                </Heading>
              </SlideFade>

            </Box>
            <Spacer />
            <Box display={["none", "block"]}>
              <Box
                as="video"
                muted
                autoPlay
                loop
                preload="auto"
                playsInline
                data-setup="{}"
                w="600px"
                h="337px"
                style={{
                  maskImage: "radial-gradient(circle at center, rgba(0, 0, 0, 1) 70%, rgba(0, 0, 0, 0) 85%)",
                  "WebkitMaskImage": "radial-gradient(circle at center, rgba(0, 0, 0, 1) 70%, rgba(0, 0, 0, 0) 85%)"
                }}
              >
                <source src="/videos/GameSizzle_sm.mp4" type="video/mp4" />
                <p className="vjs-no-js">
                  To view this video please enable JavaScript, and consider
                  upgrading to a web browser that supports HTML5 video
                </p>
              </Box>
            </Box>

          </Stack>

          <Box p="10" bgColor="brand.orange" w="100vw">
            <Center>
              <MinervaText fontStyle="italic">Empire Gambit is an update to the ancient board game latrones. Challenge your wits, in this fast-paced battle for position.</MinervaText>
            </Center>
          </Box>

          <Stack direction={["column", "row"]} spacing="5" w="70%" alignItems="center">
            <Box w="md">
              <Heading>Minerva, The Fate Teller</Heading>
              <Fade in={true} transition={{ enter: { duration: 10 } }}>
                <Text>
                Step into the realm of ancient wisdom and divine guidance with Minerva. Engage in captivating conversations with this ethereal oracle, as she unveils the secrets of your destiny. From the depths of time and knowledge, Minerva will read your fortune and offer insights that transcend the ordinary. Are you ready to unlock the secrets that the goddess of war and wisdom holds? Embrace the enigmatic allure of Minerva, The Fate Teller
                </Text>
              </Fade>

              <Link href="/minerva" mt="10" display="block">
                <Button variant="primary">Enter the realm</Button>
              </Link>
            </Box>
            <Spacer />
            <Box>
              <Box
                w="384px"
                h="384px"
                position="relative"
                display="table"
              >
                <video ref={videoRef} width="100%" height="100%" style={{ borderRadius: "100%" }}>
                  <source src="/videos/minervaTeller.mp4" type="video/mp4" />
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
            </Box>
          </Stack>

          <Divider />


          <Stack direction={["column", "row-reverse"]} spacing="5" w="80%">
            <Box w="md">
              <Heading>Empire Gambit</Heading>
              <Fade in={true} transition={{ enter: { duration: 10 } }}>
                <Text>
                  Empire Gambit is the ultimate fusion of an ancient strategy game and disruptive technology. Generative AI algorithms create a fun, dynamic, and immersive gameplay experience that changes every time you play.
                </Text>
              </Fade>
              <Heading color="brand.orange">In Closed Alpha</Heading>

            </Box>
            <Spacer />
            <Box>
              <Box
                as="video"
                loop
                preload="auto"
                playsInline
                controls
                data-setup="{}"
                w="600px"
                h="337px"
              >
                <source src="/videos/empireGambitIntroduction.mp4" type="video/mp4" />
                <p className="vjs-no-js">
                  To view this video please enable JavaScript, and consider
                  upgrading to a web browser that supports HTML5 video
                </p>
              </Box>
            </Box>
          </Stack>

          <Divider />


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
      <Box position="fixed" bottom="0" left="0" width="100vw" pointerEvents="none" zIndex="-1">
        <Box
          as="video"
          muted
          autoPlay
          loop
          preload="auto"
          w="100vw"
          h="100vh"
          objectFit="fill"
          opacity={0.2}
          filter="blur(2px)"
        >
          <source src="/videos/fireHurricane.mp4" type="video/mp4" />
          <p className="vjs-no-js">
            To view this video please enable JavaScript, and consider
            upgrading to a web browser that supports HTML5 video
          </p>
        </Box>
      </Box>
    </>
  )
}
