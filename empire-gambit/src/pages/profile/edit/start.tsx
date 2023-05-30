import Layout from "@/components/Layout";
import NavigationProfile from "@/components/NavigationProfile";
import OnBoardContainer from "@/components/OnBoardContainer";
import { Link } from "@chakra-ui/next-js";
import { Box, Button, Heading, Text, VStack } from "@chakra-ui/react";
import { NextPage } from "next";
import { useAccount } from "wagmi";

const StartProfilePage: NextPage = () => {
  const { isConnected } = useAccount()

  if (!isConnected) {
    return (
      <Layout showNavigation={false}>
        <OnBoardContainer>
          <Heading>Welcome to Empire Gambit</Heading>
          <VStack spacing="5" alignItems="left">
            <Text>First, get connected.</Text>
            <Box>
              <NavigationProfile />
            </Box>
          </VStack>
        </OnBoardContainer>
      </Layout>
    )
  }

  return (
    <Layout showNavigation={false}>
      <OnBoardContainer>
        <Box mx="10">
          <Heading lineHeight="55px">Welcome to Empire Gambit edit start</Heading>
          <VStack spacing="5" alignItems="left">
            <Text>We will authorize this device and setup a<br />username and avatar for you.</Text>
            <Link href="/profile/edit">
              <Button variant="primary">start</Button>
            </Link>
          </VStack>
        </Box>
      </OnBoardContainer>
    </Layout>
  )
}

export default StartProfilePage
