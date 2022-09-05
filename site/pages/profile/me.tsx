import { Spinner, Heading } from "@chakra-ui/react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import Layout from "../../src/components/Layout";

const Browse: NextPage = () => {
  const router = useRouter();
  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (!router) {
      return
    }
    if (isConnected && address) {
      router.push(`/profile/${address}`)
    }
  }, [address, isConnected, router])

  if (!isConnected) {
    return (
      <Layout>
        <Heading>Connect your wallet.</Heading>
      </Layout>
    )
  }

  return (
    <Layout>
      <Spinner />
    </Layout>
  );
};

export default Browse;
