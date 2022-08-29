import {
  Button,
  Spinner,
  Text,
  Box,
  Stack,
  Heading,
  VStack,
  Link,
} from "@chakra-ui/react";
import { parseEther } from "ethers/lib/utils";
import type { NextPage } from "next";
import Head from "next/head";
import NextLink from "next/link";
import { useState } from "react";
import { useMutation } from "react-query";
import { useAccount, useWaitForTransaction } from "wagmi";
import Layout from "../../../src/components/Layout";
import Video from "../../../src/components/Video";
import { useHasBoughtSkale } from "../../../src/hooks/badgeOfAssembly/europaChain";
import useIsClientSide from "../../../src/hooks/useIsClientSide";
import { defaultNetwork } from "../../../src/utils/SkaleChains";

const ClaimButton: React.FC<{
  address: string;
  txHash: string;
  onSuccess?: (txId?: string) => any;
}> = ({ address, onSuccess, txHash }) => {
  const [transactionId, setTransactionId] = useState("");
  const [err, setErr] = useState<string | undefined>(undefined);
  
  const mutation = useMutation<Response, unknown, { address: string, txHash: string }, unknown>(
    "claim-badge",
    ({ address, txHash }) => {
      console.log('fetching: ', txHash, 'for', address)
      return fetch("/api/claim/enjoyooor", {
        body: JSON.stringify({ address, txHash }),
        method: "post",
      });
    },
    {
      onSuccess: async (resp) => {
        console.log(resp);
        if (resp.status !== 201) {
          setErr("Something went wrong");
          return;
        }
        const parsedResponse = await resp.json();
        setTransactionId(parsedResponse.transactionId);
      },
    }
  );

  const txStatus = useWaitForTransaction({
    hash: transactionId,
    enabled: !!transactionId,
    chainId: defaultNetwork().id,
    onSettled: (data) => {
      console.log("settled", data);
      if (data?.status === 0) {
        setErr('transaction failed')
        return
      }
      if (onSuccess) {
        onSuccess(transactionId);
      }
    },
  });

  if (mutation.isLoading) {
    return (
      <Box>
        <Spinner />
      </Box>
    );
  }

  if (mutation.isError || txStatus.isError || err) {
    return (
      <Box>
        <Text>something went wrong.</Text>
      </Box>
    );
  }

  if (mutation.isSuccess) {
    if (txStatus.isLoading) {
      return (
        <Box>
          <Spinner />
          <Text fontSize="sm">Transaction: {transactionId}</Text>
        </Box>
      );
    }
    if (txStatus.isSuccess) {
      return (
        <Box>
          <Text>Done!</Text>
        </Box>
      );
    }
  }

  return (
    <Button
      variant="primary"
      size="lg"
      onClick={() => mutation.mutate({ address, txHash })}
    >
      Claim Badge
    </Button>
  );
};

const ClaimEnjoyooor: NextPage = () => {
  const { address } = useAccount();
  const isDomReady = useIsClientSide();

  const { data: txHash, isFetched } = useHasBoughtSkale(address)

  const [didMint, setDidMint] = useState(false);

  if (!isDomReady) {
    return (
      <>
        <Head>
          <title>Badge of Assembly: Claim SKL Enjoyooor</title>
          <meta name="description" content="Claim your SKL Enjoyooor badge" />
        </Head>
        <Layout>
          <Spinner />
        </Layout>
      </>
    );
  }

  if (didMint) {
    return (
      <Layout>
        <VStack>
          <Box maxW="75%">
            <Video
              borderRadius="lg"
              autoPlay
              controls
              animationUrl="ipfs://bafybeiga753hvhewysosiv3yb2nwo65tcxj46sq5gb5ownb7a7fulzuw5e"
            />
          </Box>
          <Text>
            Your badge is in your wallet. See it on{" "}
            {isDomReady && isFetched && address && (
              <Link href={`/browse/${address}`} textDecoration="underline">
                your personal page.
              </Link>
            )}
          </Text>
        </VStack>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Badge of Assembly: Claim</title>
        <meta name="description" content="Claim your SKL Enjoyooor" />
      </Head>
      <Layout>
        <Video
          animationUrl="ipfs://bafybeiehqfim6ut4yzbf5d32up7fq42e3unxbspez7v7fidg4hacjge5u4"
          loop
          muted
          autoPlay
          id="video-background"
        />
        <Stack direction={['column', 'row']} spacing='10'>
          <Box
            borderRadius="lg"
            borderWidth="1px"
            maxW="md"
            p="5"
          >
            <VStack align="left" spacing="10">
              <Box>
                <Heading fontSize="md">Cost</Heading>
                <Text fontSize="md">Free!</Text>
              </Box>
              <Box>
                <Heading fontSize="md">Required to claim</Heading>
                <Text fontSize="md">You bought $SKL on Ruby Exchange in the last 3 days.</Text>
              </Box>
              <Box>
                <Heading fontSize="md">Qualified?</Heading>
                {!isFetched && <Spinner />}
                {isFetched && <Text fontSize="md">{txHash ? "Yes" : "No"}</Text>}
              </Box>

              {txHash && isFetched && address && (
                <ClaimButton address={address} txHash={txHash} onSuccess={() => setDidMint(true)} />
              )}
              <Box>
                <Text fontSize="sm">
                  Trouble connecting your wallet?{" "}
                  <NextLink passHref href="/chainInfo">
                    <Link textDecoration="underline">See here.</Link>
                  </NextLink>
                </Text>
              </Box>
            </VStack>
          </Box>
          <Box
            borderRadius="lg"
            borderWidth="1px"
            maxW="md"
            p="5"
          >
            <VStack align="left" spacing="10">
              <Box>
                <Heading fontSize="md">SKALE Enjoyooor</Heading>
              </Box>
              <Box>
                <Video
                  muted
                  autoPlay
                  loop
                  controls={false}
                  animationUrl="ipfs://bafybeiefqqlksz3hx6r2omyga5l26caiupg32n6t752qkoinkg46fq2e7q"
                />
              </Box>
            </VStack>
          </Box>
        </Stack>
      </Layout>
    </>
  );
};

export default ClaimEnjoyooor;
