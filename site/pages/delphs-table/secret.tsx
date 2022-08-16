import { VStack, Text, Heading, Box, Spinner, Link, Button } from "@chakra-ui/react";
import type { NextPage } from "next";
import NextLink from "next/link";
import { useCallback } from "react";
import { useAccount } from "wagmi";
import AppLink from "../../src/components/AppLink";
import Layout from "../../src/components/Layout";
import { useUsername } from "../../src/hooks/Player";
import useIsClientSide from "../../src/hooks/useIsClientSide";
import useMqttMessages from "../../src/hooks/useMqttMessages";
import { useLogin } from "../../src/hooks/useUser";

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
          <Heading>Delph&apos;s Table</Heading>
          <Text>Find the Wootgump, don&apos;t get rekt.</Text>
          <Box pt="16">
            {isClient && isLoading && <Spinner />}
            {isClient && !isLoading && address && !username && (
              <VStack>
                <Text>
                  Looks like this is your first time here. Let&apos;s get you setup. You&apos;ll
                  need to have{" "}
                  <AppLink href="/badge-of-assembly">
                    a Badge of Assembly
                  </AppLink>
                  {" "}to play.
                </Text>
                <NextLink passHref href="/delphs-table/new">
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
                  <NextLink passHref href="/delphs-table/play">
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
