import {
  VStack,
  Text,
  Heading,
  Box,
  Spinner,
  Link,
  Button,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import NextLink from "next/link";
import { useCallback, useState } from "react";
import { useAccount } from "wagmi";
import { BigNumberish } from "ethers";
import AppLink from "../../src/components/AppLink";
import Layout from "../../src/components/Layout";
import TeamPicker from "../../src/components/TeamPicker";
import { useTeam, useUsername } from "../../src/hooks/Player";
import useIsClientSide from "../../src/hooks/useIsClientSide";
import { useLogin } from "../../src/hooks/useUser";

const Lobby: NextPage = () => {
  const { address } = useAccount();
  const { data: username, isLoading } = useUsername(address);
  const {
    isLoggedIn,
    login,
    readyToLogin,
    isLoggingIn: relayerLoading,
  } = useLogin();
  const { data: team, isFetched: teamFetched } = useTeam(address);

  const isClient = useIsClientSide();

  const [pickedTeam, setPickedTeam] = useState<BigNumberish | undefined>();
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onTeamPick = useCallback(async () => {
    try {
      setErr("");
      setLoading(true);
      await login(undefined, pickedTeam);
    } catch (err) {
      console.error("error saving team: ", err);
      setErr("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [pickedTeam, login, setLoading, setErr]);

  if (isClient && !isLoading && address && !username) {
    return (
      <Layout>
        <Heading>Delph&apos;s Table</Heading>
        <Text>You need an account to play</Text>
      </Layout>
    );
  }

  if (isClient && (isLoading || loading)) {
    return (
      <Layout>
        <Heading>Delph&apos;s Table</Heading>
        <Spinner />
      </Layout>
    );
  }

  if (isClient && teamFetched && !team) {
    return (
      <Layout>
        <Heading>Delph&apos;s Table</Heading>
        <Text>
          Pick your team to play. You only have to do this once. You can change
          your team in your{" "}
          <AppLink href={`/profile/${address}`}>profile</AppLink>.
        </Text>
        <TeamPicker address={address} onSelect={setPickedTeam} />
        <Box>
          <Button variant="primary" onClick={() => onTeamPick()}>
            Save
          </Button>
          {err && <Text colorScheme="red">{err}</Text>}
        </Box>
      </Layout>
    );
  }

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
                  Looks like this is your first time here. Let&apos;s get you
                  setup. You&apos;ll need to have{" "}
                  <AppLink href="/badge-of-assembly">
                    a Badge of Assembly
                  </AppLink>{" "}
                  to play.
                </Text>
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
          <video
            id="full-video"
            controls
            preload="auto"
            width="800"
            height="450"
            data-setup="{}"
          >
            <source src="/video/delphsPromoVideo.mp4" type="video/mp4" />
            <p className="vjs-no-js">
              To view this video please enable JavaScript, and consider
              upgrading to a web browser that supports HTML5 video
            </p>
          </video>
        </VStack>
      </Layout>
    </>
  );
};

export default Lobby;
