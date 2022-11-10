import {
  VStack,
  Text,
  Heading,
  Box,
  Spinner,
  Link,
  Button,
  Stack,
  Spacer,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import Head from "next/head";
import NextLink from "next/link";
import { useState } from "react";
import { useAccount } from "wagmi";
import Layout from "../../src/components/Layout";
import SignupModal from "../../src/components/SignupModal";
import { useUsername } from "../../src/hooks/Player";
import useIsClientSide from "../../src/hooks/useIsClientSide";
import { useLogin } from "../../src/hooks/useUser";
import border from "../../src/utils/dashedBorder";

const Lobby: NextPage = () => {
  const { address } = useAccount();
  const { data: username, isLoading } = useUsername(address);
  const {
    isLoggedIn,
    login,
    readyToLogin,
    isLoggingIn: relayerLoading,
  } = useLogin();

  const [showModal, setShowModal] = useState(false);

  const isClient = useIsClientSide();

  return (
    <>
      <Head>
        <title>Crypto Colosseum: Delph&apos;s Table</title>
      </Head>
      <SignupModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        ignoreSkip
      />
      <Layout>
        <Stack direction={["column", "row"]}>
          <VStack spacing="4" alignItems="left">
            <Heading>Delph&apos;s Table</Heading>
            <Text textColor="brand.orange">$SKL rewards for playing!</Text>
            <Text>
              Delph&apos;s Table is a multiplayer board-game. Collect Wootgump.
              Battle other warriors. Use your wits to outsmart your competitors.
            </Text>
            <Text>Win accolades, and tons of rewards.</Text>
            {isClient && !isLoading && address && !username && (
              <VStack
                backgroundImage={border}
                p="10"
                spacing={4}
                alignItems="left"
              >
                <Text>You need a username to play.</Text>
                <Box>
                  <Button onClick={() => setShowModal(true)} variant="primary">
                    Set Username
                  </Button>
                </Box>
              </VStack>
            )}
            {isClient && !isLoading && address && username && (
              <VStack spacing="5" alignItems="left">
                {!isLoggedIn && (relayerLoading || !readyToLogin) && (
                  <Spinner />
                )}
                {!isLoggedIn && !(relayerLoading || !readyToLogin) && (
                  <Box>
                    <Button variant="primary" onClick={() => login()}>
                      Login to Play
                    </Button>
                  </Box>
                )}
                {isLoggedIn && (
                  <NextLink passHref href="/delphs-table/play">
                    <Link>
                      <Button variant="primary">Play Now</Button>
                    </Link>
                  </NextLink>
                )}
              </VStack>
            )}
          </VStack>
          <Spacer />
          <Box p="10">
            <video
              id="full-video"
              controls
              preload="auto"
              width="600"
              height="450"
              data-setup="{}"
            >
              <source src="/video/delphsPromoVideo.mp4" type="video/mp4" />
              <p className="vjs-no-js">
                To view this video please enable JavaScript, and consider
                upgrading to a web browser that supports HTML5 video
              </p>
            </video>
          </Box>
        </Stack>
      </Layout>
    </>
  );
};

export default Lobby;
