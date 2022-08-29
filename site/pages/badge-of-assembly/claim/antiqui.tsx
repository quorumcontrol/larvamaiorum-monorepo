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
import useIsClientSide from "../../../src/hooks/useIsClientSide";
import useSKLBalance from "../../../src/hooks/badgeOfAssembly/useSKLBalance";
import humanFormatted from "../../../src/utils/humanFormatted";
import { defaultNetwork } from "../../../src/utils/SkaleChains";

const threshold = parseEther("1000");

const ClaimButton: React.FC<{
  address: string;
  onSuccess?: (txId?: string) => any;
}> = ({ address, onSuccess }) => {
  const [transactionId, setTransactionId] = useState("");
  const [err, setErr] = useState<string | undefined>(undefined);
  const mutation = useMutation<Response, unknown, { address: string }, unknown>(
    "claim-badge",
    ({ address }) => {
      return fetch("/api/claim", {
        body: JSON.stringify({ address }),
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
      onClick={() => mutation.mutate({ address })}
    >
      Claim Badge
    </Button>
  );
};

const Claim: NextPage = () => {
  const { address, isConnected:isSuccess } = useAccount();
  const { data } = useSKLBalance(address);
  const isClient = useIsClientSide();
  const canClaim = data && data.total.gte(threshold);
  const [didMint, setDidMint] = useState(false);

  if (!isClient) {
    return (
      <>
        <Head>
          <title>Badge of Assembly: Claim Antiqui Posessor</title>
          <meta name="description" content="Claim your Antiqui Posessor" />
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
            {isClient && isSuccess && address && (
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
        <meta name="description" content="Claim your Antiqui Posessor" />
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
                <Text fontSize="md">You must have at least $SKL 1000 in your wallet on mainnet.</Text>
              </Box>
              <Box>
                <Heading fontSize="md">Your balance</Heading>
                <Text fontSize="md">
                  Unstaked SKL Balance: {data && humanFormatted(data.liquid)}
                </Text>
                <Text fontSize="md">
                  Staked SKL Balance: {data && humanFormatted(data.staked)}
                </Text>
              </Box>

              {canClaim && address && (
                <ClaimButton address={address!} onSuccess={() => setDidMint(true)} />
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
            overflow="hidden"
            p="5"
          >
            <VStack align="left" spacing="10">
              <Box>
                <Heading fontSize="md">ANTIQUI POSESSOR</Heading>
              </Box>
              <Box>
                <Video
                  muted
                  autoPlay
                  loop
                  controls={false}
                  animationUrl="ipfs://bafybeia7ngq2a2ch7my7ffub2vbcbdtffdbefitqjute7gdk7ul5xmb2w4"
                />
              </Box>
            </VStack>
          </Box>
        </Stack>
      </Layout>
    </>
  );
};

export default Claim;
