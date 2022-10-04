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
  TableContainer,
  Table,
  Thead,
  Th,
  Tr,
  Tbody,
  Td,
  TableCaption
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
import border from "../../src/utils/dashedBorder";
import { useRouter } from "next/router";

const Lobby: NextPage = () => {
  const router = useRouter()
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

  return (
    <>
      <Layout>
        <Stack direction={["column", "row"]}>
          <VStack spacing="4" alignItems="left" maxW="40%">
            <Heading>Delph&apos;s Table</Heading>
            <Text textColor="brand.orange">
              12,500 $SKL rewards for this week!
            </Text>
            <Text>
              Delph&apos;s Table is a multiplayer board-game. Collect Wootgump.
              Battle other warriors. Use your wits to outsmart your
              competitors.
            </Text>
            <Text>Win acolades, and tons of rewards.</Text>
            {loading && <Spinner />}
            {isClient && username && teamFetched && !team && !loading && (
              <Box p="5" backgroundImage={border}>
                <Text fontSize="md">
                  Pick your team to play. You only have to do this once. You can
                  change your team later.
                </Text>
                <TeamPicker address={address} onSelect={setPickedTeam} hideTitle />
                <Box>
                  {!!pickedTeam && (
                    <Button variant="primary" onClick={() => onTeamPick()}>
                      Save
                    </Button>
                  )}
                  {err && <Text colorScheme="red">{err}</Text>}
                </Box>
              </Box>
            )}
            {isClient && !isLoading && address && !username && (
              <Box backgroundImage={border} p="10">
                <Text>
                  You need a username and a{" "}
                  <AppLink href="/badge-of-assembly">Badge of Assembly</AppLink>{" "}
                  to play.
                </Text>
              </Box>
            )}
            {isClient && !isLoading && address && username && team && !loading && (
              <VStack spacing="5" alignItems="left">
                {!isLoggedIn && (relayerLoading || !readyToLogin) && (
                  <Spinner />
                )}
                {!isLoggedIn && !(relayerLoading || !readyToLogin) && (
                  <Button variant="primary" onClick={() => login()}>Login to Play</Button>
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
