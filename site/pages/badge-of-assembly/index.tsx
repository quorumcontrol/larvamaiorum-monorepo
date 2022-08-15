import {
  VStack,
  Text,
  Stack,
  Heading,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import Head from "next/head";
import React from "react";
import BadgeClaimCard from "../../src/components/BadgeClaimCard";
import Layout from "../../src/components/Layout";

const BadgeOfAssemblyHome: NextPage = () => {
  return (
    <>
      <Head>
        <title>Crypto Colosseum: Badge of Assembly Claim Page</title>
      </Head>
      <Layout>
        <VStack spacing={5} alignItems="left" maxW="40rem">
          <Heading size={["xl", "2xl"]}>Badge of Assembly</Heading>
          <Text>
            These badges are your gateway to the crypto world, your team, and your path to success.<br />
            The more badges you possess, the more powerful you will become.
          </Text>
          <Text>Collect them all if you can.</Text>
        </VStack>
        <Stack direction={["column", "row"]} spacing="10">
          <BadgeClaimCard
            animationUrl="ipfs://bafybeia7ngq2a2ch7my7ffub2vbcbdtffdbefitqjute7gdk7ul5xmb2w4"
            name="Antiqui Posessor"
            url="./claim/antiqui"
            description="Claimable with 1000 SKL on mainnet or a member of the classic game."
          />
          <BadgeClaimCard
            animationUrl="ipfs://bafybeihze2e6pzygreosakvcemomkvorbtlqazdp2ovjx5qzxcalrt44lm"
            name="Ruby Genesis"
            url="./claim/ruby"
            description="Claimable by performing one transaction on the Europa network."
          />
          <BadgeClaimCard
            animationUrl="ipfs://bafybeiefqqlksz3hx6r2omyga5l26caiupg32n6t752qkoinkg46fq2e7q"
            name="SKALE Enjoyooor"
            url="./claim/enjoyooor"
            description="Claimable by buying $SKL on Ruby.exchange within the last 3 days."
          />
        </Stack>
      </Layout>
    </>
  );
};

export default BadgeOfAssemblyHome;
