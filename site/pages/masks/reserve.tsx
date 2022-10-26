import {
  VStack,
  Text,
  Heading,
  Button,
  Box,
  Stack,
  Spinner,
} from "@chakra-ui/react";
import { constants, utils } from "ethers";
import type { NextPage } from "next";
import Head from "next/head";
import { useAccount } from "wagmi";
import Layout from "../../src/components/Layout";
import Video from "../../src/components/Video";
import { useMaskAllowListBalance } from "../../src/hooks/masks";
import { useWootgumpBalance } from "../../src/hooks/useWootgump";
import border from "../../src/utils/dashedBorder";
import humanFormatted from "../../src/utils/humanFormatted";

const COST_OF_SPOT = utils.parseEther('15000')

const ReserveMask: NextPage = () => {
  const { address } = useAccount()
  const { data: allowListBalance } = useMaskAllowListBalance(address)
  const { data:gumpBalance } = useWootgumpBalance(address)

  const canAfford = gumpBalance && gumpBalance.gte(COST_OF_SPOT)

  return (
    <>
      <Head>
        <title>Crypto Colosseum: Masks of the Ancients Reservation</title>
      </Head>
      <Layout>
        <Stack direction={["column", "row"]} justify="space-between">
          <Box p="10">
            <Video
              animationUrl="/video/maskRapidFire.mp4"
              autoPlay
              playsInline
              muted
              loop
              maxH="600px"
              maxW="600px"
              margin="auto"
            />
          </Box>
          <VStack
            p="10"
            borderColor="brand.orange"
            borderWidth="1px"
            alignItems="left"
            maxW="38%"
            spacing={5}
          >
            <Heading>Presale: Mask of the Ancients</Heading>
            <Text fontSize="md">
              Masks may be used in the summoning ritual to bring forth an artifact
              or recruit of the same rarity. Other benefits acrue to early mask
              holders. Masks of the Ancients come in 3 rarities:
              uncommon, rare, and ultra-rare.
            </Text>
            <Box p="5" backgroundImage={border}>
              <Text>One mask costs $GUMP 15,000</Text>
            </Box>
            <Box fontSize={"md"}>
              { allowListBalance && gumpBalance && (
                <>
                  <Text>Mask Balance: {allowListBalance.toString()}</Text>
                  <Text>$GUMP Balance: {humanFormatted(gumpBalance)}</Text>
                </>
              )}
              {!(allowListBalance && gumpBalance) && (
                <Spinner />
              )}
            </Box>
            { canAfford && <Button variant="primary">Buy (1) Presale Mask</Button> }
          </VStack>
        </Stack>
      </Layout>
    </>
  );
};

export default ReserveMask;
