import { Text, HStack, Spinner, VStack, Stack, Heading } from "@chakra-ui/react";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "../../src/components/Layout";
import NFTCard from "../../src/components/NFTCard";
import { MetadataWithId, useUserBadges } from "../../src/hooks/BadgeOfAssembly";
import { useUsername } from "../../src/hooks/Player";

const Browse: NextPage = () => {
  const router = useRouter();
  const { address } = router.query;
  const { data: badges, isLoading } = useUserBadges(
    address as string | undefined
  );
  const { data: username } = useUsername(address as string | undefined);

  return (
    <>
      <Head>
        <title>Badge of Assembly: Profile</title>
        <meta name="description" content={`Larva Maiorum profile page for ${address}`} />
      </Head>
      <Layout>
        <VStack spacing="10">
          <Text fontSize="lg">{username || address || "..."}</Text>
          <Heading>BADGES</Heading>
          <Stack direction={["column", "row"]} spacing="10">
            {isLoading && <Spinner />}
            {badges?.map((metadata: MetadataWithId, i) => {
              return <NFTCard metadata={metadata} key={`nftcard-${i}`} />;
            })}
          </Stack>
        </VStack>
      </Layout>
    </>
  );
};

export default Browse;
