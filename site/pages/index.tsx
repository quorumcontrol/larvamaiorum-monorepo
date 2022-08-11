import { VStack, Text, Heading, Box, Spinner, Link, Button } from "@chakra-ui/react";
import type { NextPage } from "next";
import NextLink from "next/link";
import { useCallback } from "react";
import { useAccount } from "wagmi";
import Layout from "../src/components/Layout";
import { useUsername } from "../src/hooks/Player";
import useIsClientSide from "../src/hooks/useIsClientSide";
import useMqttMessages from "../src/hooks/useMqttMessages";
import { useLogin } from "../src/hooks/useUser";

const Home: NextPage = () => {
  const { address } = useAccount();
  const { data: username, isLoading } = useUsername(address);
  const {
    isLoggedIn,
    login,
    readyToLogin,
    isLoggingIn:relayerLoading
  } = useLogin();
  const isClient = useIsClientSide();
  const handler = useCallback((topic:string,msg:Buffer) => {
    console.log('mqtt: ', topic, msg.toString())
  }, [])
  useMqttMessages(handler)

  return (
    <>
      <Layout>
        <VStack mt="50" spacing={5}>
          <Heading>Delph's Table</Heading>
          <Text>Find the Wootgump, don't get rekt.</Text>
          <Box pt="16">
            {isClient && isLoading && <Spinner />}
            {isClient && !isLoading && address && !username && (
              <VStack>
                <Text>
                  Looks like this is your first time here. Let's get you setup. You'll
                  need to have{" "}
                  <NextLink passHref href="https://boa.larvamaiorum.com/claim">
                    <Link>a Badge of Assembly</Link>
                  </NextLink>
                  {" "}to play.
                </Text>
                <NextLink passHref href="/new">
                  <Link>
                    <Button>Create Account</Button>
                  </Link>
                </NextLink>
              </VStack>
            )}
            {isClient && !isLoading && address && username && (
              <VStack spacing="5">
                <Text>Welcome back {username}.</Text>
                {!isLoggedIn && (relayerLoading || !readyToLogin) && (
                  <Spinner />
                )}
                {!isLoggedIn && !(relayerLoading || !readyToLogin) && (
                  <Button onClick={() => login()}>Login</Button>
                )}
                {isLoggedIn && (
                  <NextLink passHref href="/play">
                    <Link>
                      <Button>Play</Button>
                    </Link>
                  </NextLink>
                )}
              </VStack>
            )}
          </Box>
        </VStack>
      </Layout>
    </>
  );
};

export default Home;
