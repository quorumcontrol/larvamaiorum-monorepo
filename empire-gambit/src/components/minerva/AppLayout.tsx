import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { Box, Button, Center, Heading, Text, VStack } from '@chakra-ui/react'
import { useMaskInventory } from '@/hooks/useMasks'
import NavigationProfile from '../NavigationProfile'
import useIsClientSide from '@/hooks/useIsClientSide'

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const session = useSession()
  const { data:maskBalance, isLoading } = useMaskInventory()
  const isClient = useIsClientSide()

  if (!isClient || isLoading) {
    return (
      <Box bg="brand.background" minH="100vh" p={4}>
        <Center flexDirection="column" h="100%">
          <VStack>
            <Heading>Waiting</Heading>
            <Text>One second my child, I am looking for your masks.</Text>
          </VStack>
        </Center>
      </Box>
    )
  }

  if (!session) {
    return (
      <Box bg="brand.background" minH="100vh" p={4}>
        <Center flexDirection="column" h="100%">
          <VStack>
            <Heading>who are you?</Heading>
            <Text>As minerva, I will need to make sure I know you.</Text>
            <NavigationProfile />
          </VStack>
        </Center>
      </Box>
    )
  }

  if (maskBalance && maskBalance <= 0) {
    return (
      <Box bg="brand.background" minH="100vh" p={4}>
        <Center flexDirection="column" h="100%">
          <VStack>
            <Heading>I am sorry</Heading>
            <Text>I am sorry my child, you must have a mask to wear in my temple.</Text>
            <NavigationProfile />
          </VStack>
        </Center>
      </Box>
    )
  }

  return (
    <>
      { children }
    </>
  )
}

export default AppLayout
