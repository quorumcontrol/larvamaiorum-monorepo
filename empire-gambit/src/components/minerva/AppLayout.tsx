import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { Box, Button, Center, Heading, Text, VStack } from '@chakra-ui/react'

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const session = useSession()
  const supabase = useSupabaseClient()

  return (
    <>
      {session ? (
        children
      ) : (
        <Box bg="brand.background" minH="100vh" p={4}>
          <Center flexDirection="column" h="100%">
            <VStack>
              <Heading>Using the app requires sign up</Heading>
              <Text>Placeholder</Text>
              <Button onClick={async () => console.log(await supabase.auth.getUser()) }>Do not click here</Button>
            </VStack>
          </Center>
        </Box>
      )}
    </>
  )
}

export default AppLayout
