import { VStack, Text, Link, Box, Stack, Button } from "@chakra-ui/react";
import type { NextPage } from "next";
import Head from "next/head";
import NextLink from "next/link";
import Layout from "../../../src/components/Layout";
import Video from "../../../src/components/Video";

const ChainInfo: NextPage = () => {
  return (
    <>
      <Head>
        <title>Crypto Colosseum: Badge of Assembly Claim Page</title>
      </Head>
      <Layout>
        <Stack direction={["column", "row"]} spacing="10">
          <Box
            borderRadius="lg"
            borderWidth="1px"
            w="sm"
            h="md"
            overflow="hidden"
          >
            <Box h="70%" backgroundColor="#000">
                <Video
                  animationUrl="ipfs://bafybeia7ngq2a2ch7my7ffub2vbcbdtffdbefitqjute7gdk7ul5xmb2w4"
                  controls
                  autoPlay
                  loop
                  muted
                />
            </Box>
            <VStack p="5" mb="5">
              <Text
                mt="4"
                fontWeight="semibold"
                as="h4"
                lineHeight="tight"
                noOfLines={1}
              >
                Antiqui Posessor
              </Text>
              <NextLink passHref href="./claim/antiqui">
                <Link>
                  <Button>Claim</Button>
                </Link>
              </NextLink>
            </VStack>
          </Box>
          <Box
            borderRadius="lg"
            borderWidth="1px"
            w="sm"
            h="md"
            overflow="hidden"
          >
            <Box h="70%" backgroundColor="#000">
                <Video
                  animationUrl="ipfs://bafybeihze2e6pzygreosakvcemomkvorbtlqazdp2ovjx5qzxcalrt44lm"
                  controls
                  autoPlay
                  loop
                  muted
                />
            </Box>
            <VStack p="5" mb="5">
              <Text
                mt="4"
                fontWeight="semibold"
                as="h4"
                lineHeight="tight"
                noOfLines={1}
              >
                Ruby Genesis
              </Text>
              <NextLink passHref href="./claim/ruby">
                <Link>
                  <Button>Claim</Button>
                </Link>
              </NextLink>
            </VStack>
          </Box>
          <Box
            borderRadius="lg"
            borderWidth="1px"
            w="sm"
            h="md"
            overflow="hidden"
          >
            <Box h="70%" backgroundColor="#000">
                <Video
                  animationUrl="ipfs://bafybeiefqqlksz3hx6r2omyga5l26caiupg32n6t752qkoinkg46fq2e7q"
                  controls
                  autoPlay
                  loop
                  muted
                />
            </Box>
            <VStack p="5" mb="5">
              <Text
                mt="4"
                fontWeight="semibold"
                as="h4"
                lineHeight="tight"
                noOfLines={1}
              >
                SKALE Enjoyooor
              </Text>
              <NextLink passHref href="./claim/enjoyooor">
                <Link>
                  <Button>Claim</Button>
                </Link>
              </NextLink>
            </VStack>
          </Box>
        </Stack>
      </Layout>
    </>
  );
};

export default ChainInfo;
