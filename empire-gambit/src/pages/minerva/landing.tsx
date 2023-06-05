import CircularVideo from "@/components/CircularVideo";
import Footer from "@/components/Footer";
import MinervaText from "@/components/minerva/MinervaText";
import { PageEffects } from "@/components/minerva/PageEffects";
import { Button, Center, Heading, Text, VStack, keyframes } from "@chakra-ui/react";
import { NextPage } from "next";
import Head from "next/head"
import { Link } from "@chakra-ui/next-js"
import MinervaHead from "@/components/minerva/MinervaHead";

const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  70% {
    transform: scale(1.08);
    opacity: 1.0;
  }
  100% {
    transform: scale(1);
    opacity: 0.7;
  }
`

const LandingPage: NextPage = () => {
  return (
    <>
      <Head>
        <meta property="og:url" content="https://empiregambit.com/minerva/landing" />
      </Head>
      <MinervaHead />
      <PageEffects
        position="absolute"
        bottom="0"
        left="0"
        trigger={true}
      />
      <Center minH="100vh">
        <VStack spacing="4" maxW="900px" bg="brand.background" ml="4">
          <Heading textAlign="center">Discover Minerva: Your AI Fortune Teller</Heading>
          <MinervaText>Astrology and Tarot in the Digital Age.</MinervaText>
          <CircularVideo src="/videos/minerva_landing_page.mp4" autoPlay playsInline />
          <Button as={Link} variant="primary" animation={`${pulseAnimation} 4s infinite ease-in-out`} href="/minerva">Start Your Free Reading</Button>
          <VStack alignItems="left" spacing="4" pt="8">
            <Text>Welcome to the future of fortune telling with Minerva, our AI-powered oracle in Empire Gambit. Drawing on the wisdom of ancient Rome and the power of advanced AI, Minerva offers a free personalized astrology or tarot reading every day, tailored to your unique journey.</Text>
            <Text>But that&apos;s not all. If the stars align, Minerva will reward you with a unique digital collectible, a keepsake from your cosmic exploration.</Text>
            <MinervaText>Dive into a revolutionary fusion of tradition and technology. With Minerva, anticipate the future, interpret the stars, and embrace the mystic world of tarot, all in a digital realm.</MinervaText>
          </VStack>
          <Footer />
        </VStack>
      </Center>
    </>
  )
}

export default LandingPage