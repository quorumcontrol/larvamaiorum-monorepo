import { VStack, Text, Heading, Button, Box, ListItem, UnorderedList } from "@chakra-ui/react";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Layout from "../src/components/Layout";
import classicBannerImage from "../assets/images/classicBanner.jpg";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Crypto Colosseum: Classic</title>
      </Head>
      <Layout>
        <VStack spacing={10} textAlign="center">
          <Heading textTransform="uppercase">Crypto Colosseum: Classic</Heading>
          <Text>
            Crypto Colosseum: Classic has been live on the Polygon network for
            over a year.<br />It has often been in the top 10 games on that network.
          </Text>
          <Box>
            <Link href="https://arena.cryptocolosseum.com" target="_blank">
              <Button variant="solid">Visit the Arena</Button>
            </Link>
          </Box>
          <Box>
            <Image
              src={classicBannerImage}
              alt="Crypto Colosseum classic art of two gladiators about to battle"
            />
          </Box>
          <Text>
            Use Your Superior Strategy To Back Gladiators And Win On Daily And
            Weekly Tournaments
          </Text>
          <UnorderedList textAlign="left">
            <ListItem>Back your favorite gladiators to win</ListItem>

            <ListItem>Buy items to boost your warrior’s chances (or use them to undermine your foes)</ListItem>

            <ListItem>Pick your champions carefully based on the real-world performance of crypto assets</ListItem>

            <ListItem>Prize Pools are juiced so the odds are stacked in your favor</ListItem>
          </UnorderedList>
        </VStack>
      </Layout>
    </>
  );
};

export default Home;
