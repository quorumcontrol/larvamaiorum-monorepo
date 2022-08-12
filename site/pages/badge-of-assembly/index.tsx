import {
  VStack,
  Text,
  Link,
  Box,
  Stack,
  Button,
  Heading,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import Head from "next/head";
import NextLink from "next/link";
import React from "react";
import Layout from "../../src/components/Layout";
import Video from "../../src/components/Video";

const BadgeClaimCard: React.FC<{
  animationUrl: string;
  name: string;
  url: string;
  description: string;
}> = ({ animationUrl, name, url, description }) => {
  return (
    <Box borderRadius="lg" borderWidth="1px" w="sm" pb="8">
      <Box h="70%" backgroundColor="#000">
        <Video animationUrl={animationUrl} controls autoPlay loop muted />
      </Box>
      <VStack p="5" mb="5" spacing={6}>
        <Text
          mt="4"
          fontWeight="semibold"
          as="h4"
          lineHeight="tight"
          noOfLines={1}
        >
          {name}
        </Text>
        <Text noOfLines={3} fontSize="md">
          {description}
        </Text>
        <NextLink href={url}>
          <Button>Claim</Button>
        </NextLink>
      </VStack>
    </Box>
  );
};

const ChainInfo: NextPage = () => {
  return (
    <>
      <Head>
        <title>Crypto Colosseum: Badge of Assembly Claim Page</title>
      </Head>
      <Layout>
        <VStack spacing={5}>
          <Heading textTransform="uppercase">Badge of Assembly</Heading>
          <Text>These badges are your entry pass to the crypto roman world. They are your team and your tribe.</Text>
          <Text>The more badges you possess, the more powerful you will become.</Text>
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

export default ChainInfo;
