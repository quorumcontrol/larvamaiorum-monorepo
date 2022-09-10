import {
  VStack,
  Text,
  Heading,
  Button,
  Spinner,
  HStack,
  Box,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useCallback, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import LoggedInLayout from "../../../src/components/LoggedInLayout";
import Video from "../../../src/components/Video";
import { useUserBadges } from "../../../src/hooks/BadgeOfAssembly";
import {
  useRegisterInterest,
  useWaitForTable,
  useWaitingPlayers,
} from "../../../src/hooks/Lobby";
import { useUsername } from "../../../src/hooks/Player";
import useIsClientSide from "../../../src/hooks/useIsClientSide";
import border from "../../../src/utils/dashedBorder";

const Play: NextPage = () => {
  const { address } = useAccount();
  const { data: username } = useUsername();
  const isClient = useIsClientSide();
  const [manualWaiting, setManualWaiting] = useState(false)
  const { data: waitingPlayers, isLoading } = useWaitingPlayers();
  const registerInterestMutation = useRegisterInterest();
  const router = useRouter();
  const { data: userBadges, isLoading: badgesLoading } = useUserBadges();

  const isTouch = useMemo(() => {
    return document && !!(document as any).createTouch
  }, [])

  const handleTableRunning = useCallback(
    (tableId?: string) => {
      router.push(`/delphs-table/play/${tableId}`);
    },
    [router]
  );

  useWaitForTable(handleTableRunning);

  const isWaiting = manualWaiting || (waitingPlayers || []).some(
    (waiting) => waiting.addr === address
  );

  const onJoinClick = async () => {
    console.log("join click");
    setManualWaiting(true)
    return registerInterestMutation.mutate({ name: username!, addr: address! });
  };

  if (!isClient || badgesLoading) {
    return (
      <LoggedInLayout>
        <Spinner />
      </LoggedInLayout>
    );
  }

  if (userBadges?.length === 0) {
    return (
      <LoggedInLayout>
        <Text>You currently need a badge to play Delph&apos;s Table</Text>
      </LoggedInLayout>
    );
  }

  return (
    <>
      <Video
        animationUrl="ipfs://bafybeiehqfim6ut4yzbf5d32up7fq42e3unxbspez7v7fidg4hacjge5u4"
        loop
        muted
        autoPlay
        id="jungle-video-background"
      />
    <LoggedInLayout>

      <VStack>
        <VStack spacing={5} backgroundImage={border} p="20">
          <Heading>Play Delph&apos;s Table</Heading>
          <Text>Find the Wootgump, don&apos;t get rekt.</Text>
          <VStack p="4" spacing="2">
            {((isClient && !isLoading && waitingPlayers) || []).map(
              (waiting) => {
                return (
                  <Text fontSize="md" key={`waiting-addr-${waiting.addr}`}>
                    {waiting.name}
                  </Text>
                );
              }
            )}
          </VStack>
            {!isWaiting && !registerInterestMutation.isLoading && (
            <Button onClick={onJoinClick} variant="primary">Join Table</Button>
          )}
          {isWaiting && (
            <HStack>
              <Text>Waiting for a table</Text>
              <Spinner />
            </HStack>
          )}
          <Box>
            {isTouch && <Text>One finger orbits, 2 fingers scrolls about, tap and hold to select a square, pinch to zoom</Text>}
            {!isTouch && <Text>Left mouse orbits, right mouse scrolls (2 finger, push on trackpad), tap and hold to select a square, scroll to zoom</Text>}
          </Box>
        </VStack>
      </VStack>
    </LoggedInLayout>
    </>
  );
};

export default Play;
