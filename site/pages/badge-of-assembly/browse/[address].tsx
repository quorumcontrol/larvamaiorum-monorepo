import { Text, HStack, Spinner } from "@chakra-ui/react";
import NFTCard from '../../../src/components/NFTCard'
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "../../../src/components/Layout";
import { MetadataWithId, useUserBadges } from "../../../src/hooks/BadgeOfAssembly";

const Browse: NextPage = () => {
  const router = useRouter();
  const { address } = router.query;
  const { data, isLoading } = useUserBadges(address as (string | undefined));

  return (
    <>
      <Head>
        <title>Badge of Assembly: User Badges</title>
        <meta name="description" content={`Badges for ${address}`} />
      </Head>
      <Layout>
        <Text fontSize="sm">Badges held by: {address}</Text>
        <HStack spacing="10">
          { isLoading && <Spinner />}
          {data?.map((metadata:MetadataWithId, i) => {
            return <NFTCard metadata={metadata} key={`nftcard-${i}`} />;
          })}
        </HStack>
      </Layout>
    </>
  );
};

export default Browse;
