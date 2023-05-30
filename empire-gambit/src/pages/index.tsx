import Layout from '@/components/Layout'
import { Box, Button, Center, Divider, Fade, Heading, SlideFade, Spacer, Stack, Text, VStack } from '@chakra-ui/react'
import Image from 'next/image'
import initializedLogo from "@/assets/partners/Initialized.png"
import gameTradeLogo from "@/assets/partners/GameTradeMarket.png"
import boostVCLogo from "@/assets/partners/BoostVC.png"
import iaVenturesLogo from "@/assets/partners/IAVentures.png"
import skaleLogo from "@/assets/partners/Skale.png"
import MinervaText from '@/components/minerva/MinervaText'
import { Link } from '@chakra-ui/next-js'
import CircularVideo from '@/components/CircularVideo'

export default function Home() {

  return (
    <>
      <Layout>
        <VStack spacing="50px" zIndex="1" px="4">

          <Stack direction={["column", "row"]} spacing="5" alignItems="center">
            <Box>
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
              <MinervaText fontStyle="italic">Empire Gambit is an update to the ancient board game latrones. Challenge your wits in this fast-paced battle for position.</MinervaText>
            </Center>
          </Box>

          <Stack direction={["column", "row"]} spacing="5" maxW="900px" alignItems="center">
            <Box>
              <Heading>Minerva, The Fate Teller</Heading>
              <Fade in={true} transition={{ enter: { duration: 10 } }}>
                <Text>
                  Step into the realm of ancient wisdom and divine guidance with Minerva. Engage in captivating conversations with this ethereal oracle, as she unveils the secrets of your destiny. From the depths of time and knowledge, Minerva will read your fortune and offer insights that transcend the ordinary. Are you ready to unlock the secrets that the goddess of war and wisdom holds? Embrace the enigmatic allure of Minerva, The Fate Teller.
                </Text>
              </Fade>

              <Link href="/minerva" mt="10" display="block">
                <Button variant="primary">Enter the realm</Button>
              </Link>
            </Box>
            <Spacer />
            <Box>
              <CircularVideo
                src='/videos/minervaTeller.mp4'
                w="384px"
                h="384px"
              />
            </Box>
          </Stack>
          <Divider />


          <Stack direction={["column", "row"]} spacing="5" maxW="900px">
            <Box>
              <Box>
                <video
                  loop
                  preload="auto"
                  controls
                >
                  <source src="/videos/empireGambitIntroduction.mp4" type="video/mp4" />
                  <p className="vjs-no-js">
                    To view this video please enable JavaScript, and consider
                    upgrading to a web browser that supports HTML5 video
                  </p>
                </video>
              </Box>
            </Box>
            <Spacer />

            <Box>
              <Heading>Empire Gambit</Heading>
              <Fade in={true} transition={{ enter: { duration: 10 } }}>
                <Text>
                  Empire Gambit is the ultimate fusion of an ancient strategy game and disruptive technology. Generative AI algorithms create a fun, dynamic, and immersive gameplay experience that changes every time you play.
                </Text>
              </Fade>
              <Heading color="brand.orange">In Closed Alpha</Heading>

            </Box>

          </Stack>

          <Divider />


          <VStack alignItems="center" spacing={[1, 4]} py={[5, 0]} bgColor={["black", "transparent"]}>
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
