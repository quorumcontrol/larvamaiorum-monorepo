import { VStack, Text, Heading, Button, Box } from "@chakra-ui/react";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import Layout from "../../src/components/Layout";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Crypto Colosseum: Badge of Assembly</title>
      </Head>
      <Layout>
        <VStack mt="50" spacing={5}>
          <Heading>Badge of Assembly</Heading>
          <Text>Show support for your community.</Text>
          <Box pt="16">
            <Link href="/badge-of-assembly/claim">
              <Button variant="solid">Claim Your Badges</Button>
            </Link>
          </Box>
        </VStack>
      </Layout>
    </>
  );
};

export default Home;
