import DistractionFreeLayout from "@/components/DistractionFreeLayout";
import NavigationProfile from "@/components/NavigationProfile";
import { Link } from "@chakra-ui/next-js";
import { Box, Button, Heading, Text } from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { NextPage } from "next";
import { useAccount } from "wagmi";

const StartProfilePage: NextPage = () => {
  const { isConnected } = useAccount()

  if (!isConnected) {
    return (
      <DistractionFreeLayout>
        <Heading>Welcome to Empire Gambit</Heading>
        <Text>First, get connected.</Text>
        <Box>
          <NavigationProfile />

        </Box>
      </DistractionFreeLayout>
    )
  }

  return (
    <DistractionFreeLayout>
      <Heading>Welcome to Empire Gambit</Heading>
      <Text>We will create a username and an avatar for you.</Text>
      <Text>You will need to authorize this device.</Text>
      <Link href="/profile/edit">
        <Button variant="primary">start</Button>
      </Link>
    </DistractionFreeLayout>
  )
}

export default StartProfilePage
