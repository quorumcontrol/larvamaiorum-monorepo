import {
  VStack,
  Text,
  Heading,
  Button,
  Box,
  ListItem,
  UnorderedList,
  Stack,
  Spacer,
  Flex,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Layout from "../../src/components/Layout";
import Video from "../../src/components/Video";
import border from "../../src/utils/dashedBorder";

const ReserveMask: NextPage = () => {
  return (
    <>
      <Head>
        <title>Crypto Colosseum: Classic</title>
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
            maxW="33%"
            spacing={5}
          >
            <Heading>Mask Presale</Heading>
            <Text fontSize="md">
              Masks may be used in a summoning ritual to bring forth an artifact
              or recruit of the same rarity. Other benefits acrue to early mask
              holders. Larva Maiorum (masks of our ancestors) come in 3 rarities
              (uncommon, rare, ultra-rare).
            </Text>
            <Box p="5" backgroundImage={border}>
              <Text>One mask costs $GUMP 15,000</Text>
            </Box>
            <Box fontSize={"md"}>
              <Text>Mask Balance: 0</Text>
              <Text>$GUMP Balance: 76,000</Text>
            </Box>
            <Button variant="primary">Buy 1 Presale Mask</Button>
          </VStack>
        </Stack>
      </Layout>
    </>
  );
};

export default ReserveMask;
