import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { Box, Button, Center, Heading, Text, VStack, keyframes } from '@chakra-ui/react'
import { Image } from "@chakra-ui/next-js";
import { useMaskInventory } from '@/hooks/useMasks'
import NavigationProfile from '../NavigationProfile'
import useIsClientSide from '@/hooks/useIsClientSide'
import MinervaText from './MinervaText'
import { PageEffects } from './PageEffects';
import { useTokenBalance } from '@/hooks/useTokens';

import templeSrc from "../../assets/templeAtNight.png"
import marketSrc from "../../assets/market.png"

const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.5;
  }
  70% {
    transform: scale(1.08);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 0.5;
  }
`

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const session = useSession()
  const { data: maskBalance, isLoading } = useMaskInventory()
  const { data: tokenBalance } = useTokenBalance()
  const isClient = useIsClientSide()

  if (!isClient || isLoading) {
    return (
      <>
        <PageEffects
          position="absolute"
          bottom="0"
          left="0"
          trigger={true}
        />
        <Box bg="brand.background" minH="100vh" p={4}>
          <Center flexDirection="column" h="100%">
            <VStack spacing="8">
              <MinervaText>I will be with you in one moment, visitor.</MinervaText>
              <Box
                animation={`${pulseAnimation} 10s infinite ease-in-out`}
                style={{
                  maskImage: "radial-gradient(circle at center, rgba(0, 0, 0, 1) 40%, rgba(0, 0, 0, 0) 70%%)",
                  "WebkitMaskImage": "radial-gradient(circle at center, rgba(0, 0, 0, 1) 40%, rgba(0, 0, 0, 0) 70%)"
                }}
              >
                <Image src={templeSrc} alt="a dark temple at night" boxSize="lg" />
              </Box>
            </VStack>
          </Center>
        </Box>
      </>
    )
  }

  if (!session) {
    return (
      <>
        <PageEffects
          position="absolute"
          bottom="0"
          left="0"
          trigger={true}
        />
        <Box bg="brand.background" minH="100vh" p={4}>
          <Center flexDirection="column" h="100%">
            <VStack spacing="8">
              <MinervaText>My visitor, you must have tokens or a mask to continue this ceremony.</MinervaText>
              <Box
                animation={`${pulseAnimation} 10s infinite ease-in-out`}
                style={{
                  maskImage: "radial-gradient(circle at center, rgba(0, 0, 0, 1) 40%, rgba(0, 0, 0, 0) 70%%)",
                  "WebkitMaskImage": "radial-gradient(circle at center, rgba(0, 0, 0, 1) 40%, rgba(0, 0, 0, 0) 70%)"
                }}
              >
                <Image src={marketSrc} alt="a dark temple at night" boxSize="lg" />
              </Box>
            </VStack>
          </Center>
        </Box>
      </>
    )
  }

  if (maskBalance && maskBalance <= 0) {
    return (
      <>
        <PageEffects
          position="absolute"
          bottom="0"
          left="0"
          trigger={true}
        />
        <Box bg="brand.background" minH="100vh" p={4}>
          <Center flexDirection="column" h="100%">
            <VStack spacing="8">
              <MinervaText>My visitor, you must have tokens or a mask to continue this ceremony.</MinervaText>
              <Box
                animation={`${pulseAnimation} 10s infinite ease-in-out`}
                style={{
                  maskImage: "radial-gradient(circle at center, rgba(0, 0, 0, 1) 40%, rgba(0, 0, 0, 0) 70%%)",
                  "WebkitMaskImage": "radial-gradient(circle at center, rgba(0, 0, 0, 1) 40%, rgba(0, 0, 0, 0) 70%)"
                }}
              >
                <Image src={marketSrc} alt="a dark temple at night" boxSize="lg" />
              </Box>
            </VStack>
          </Center>
        </Box>
      </>
    )
  }

  return (
    <>
      {children}
    </>
  )
}

export default AppLayout
