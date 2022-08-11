import { VStack, Text, Heading, Link, Box, Stack } from "@chakra-ui/react";
import type { NextPage } from "next";
import Head from "next/head";
import NextLink from "next/link";
import Layout from "../src/components/Layout";
import { skaleMainnet } from "../src/utils/SkaleChains";

const ChainInfo: NextPage = () => {
  return (
    <>
      <Head>
        <title>Crypto Colosseum: Chain Info</title>
      </Head>
      <Layout>
        <Stack direction={["column", "row"]} spacing="10">
          <Box borderRadius="lg" borderWidth="1px" w="sm" minH="md" p="5">
            <VStack align="left" spacing="10">
              <Box>
                <Heading fontSize="md">Our chain</Heading>
                <Text fontSize="md">
                  Delph's Table uses a{" "}
                  <NextLink passHref href="https://skale.network/">
                    <Link>SKALE sChain</Link>
                  </NextLink> which may not be added
                  to your wallet. The easiest way to add is to click
                  &quot;wrong network&quot; in the top right after connecting
                  your wallet.
                </Text>
              </Box>
              <Box>
                <Text fontSize="md">
                  <Heading fontSize="md">Note on Metamask Mobile</Heading>
                  If you are using the metamask mobile browser, there is a long
                  standing bug in that application. You will have to manually
                  add the Crypto Rome Network using the information on the
                  right.{" "}
                  <NextLink passHref href="https://metamask.zendesk.com/hc/en-us/articles/360043227612-How-to-add-a-custom-network-RPC">
                    <Link textDecoration="underline">See this article for help.</Link>
                  </NextLink>
                </Text>
              </Box>
            </VStack>
          </Box>
          <Box
            borderRadius="lg"
            borderWidth="1px"
            w="md"
            h="md"
            overflow="hidden"
            p="5"
          >
            <VStack align="left" spacing="10">
              <Box>
                <Heading fontSize="md">Chain Name</Heading>
                <Text fontSize="md">Crypto Rome Network</Text>
              </Box>
              <Box>
                <Heading fontSize="md">Chain Id</Heading>
                <Text fontSize="md">{skaleMainnet.id}</Text>
              </Box>
              <Box>
                <Heading fontSize="md">RpcUrl</Heading>
                <Text fontSize="md">{skaleMainnet.rpcUrls.default}</Text>
              </Box>
              <Box>
                <Heading fontSize="md">Currency Symbol</Heading>
                <Text fontSize="md">{skaleMainnet.nativeCurrency?.symbol}</Text>
              </Box>
              <Box>
                <Heading fontSize="md">Block Explorer</Heading>
                <Text fontSize="md">
                  {skaleMainnet.blockExplorers?.default.url}
                </Text>
              </Box>
            </VStack>
          </Box>
        </Stack>
      </Layout>
    </>
  );
};

export default ChainInfo;
