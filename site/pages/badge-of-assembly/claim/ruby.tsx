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
import type { NextPage } from "next";
import Head from "next/head";
import NextLink from "next/link";
import { useState } from "react";
import { useMutation, useQuery } from "react-query";
import { useAccount, useWaitForTransaction } from "wagmi";
import Layout from "../../../src/components/Layout";
import Video from "../../../src/components/Video";
import useIsClientSide from "../../../src/hooks/useIsClientSide";

const ClaimButton: React.FC<{
  address: string;
  onSuccess?: (txId?: string) => any;
}> = ({ address, onSuccess }) => {
  const [transactionId, setTransactionId] = useState("");
  const [err, setErr] = useState<string | undefined>(undefined);
  const mutation = useMutation<Response, unknown, { address: string }, unknown>(
    "claim-badge",
    ({ address }) => {
      return fetch("/api/claim/ruby", {
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
      variant="solid"
      size="lg"
      onClick={() => mutation.mutate({ address })}
    >
      Claim Badge
    </Button>
  );
};

const hasTransacted = async (address: string) => {
  const resp = await fetch(`https://elated-tan-skat.explorer.mainnet.skalenodes.com/api?module=account&action=txlist&address=${address}`)
  if (resp.status !== 200) {
    throw new Error('bad response')
  }
  const result = await resp.json()
  return result.result.length > 0
}

const ClaimRuby: NextPage = () => {
  const { address } = useAccount();
  const isDomReady = useIsClientSide();

  const { data:canClaim, isFetched } = useQuery('europa-transactions', () => {
    return hasTransacted(address!)
  }, {
    enabled: !!address,
  })

  const [didMint, setDidMint] = useState(false);

  if (!isDomReady) {
    return (
      <>
        <Head>
          <title>Badge of Assembly: Claim Ruby Genesis</title>
          <meta name="description" content="Claim your Ruby Genesis badge" />
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
        <meta name="description" content="Claim your Ruby Genesis" />
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
            w="sm"
            h="md"
            overflow="hidden"
            p="5"
          >
            <VStack align="left" spacing="10">
              <Box>
                <Heading fontSize="md">Cost</Heading>
                <Text fontSize="md">Free!</Text>
              </Box>
              <Box>
                <Heading fontSize="md">Required to claim</Heading>
                <Text fontSize="md">Your address has done a transaction on Europa.</Text>
              </Box>
              <Box>
                <Heading fontSize="md">Qualified?</Heading>
                {!isFetched && <Spinner />}
                {isFetched && <Text fontSize="md">{canClaim ? "Yes" : "No"}</Text>}
              </Box>

              {canClaim && isFetched && address && (
                <ClaimButton address={address} onSuccess={() => setDidMint(true)} />
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
            w="sm"
            h="md"
            overflow="hidden"
            p="5"
          >
            <VStack align="left" spacing="10">
              <Box>
                <Heading fontSize="md">RUBY GENESIS</Heading>
              </Box>
              <Box>
                <Video
                  muted
                  autoPlay
                  loop
                  controls={false}
                  animationUrl="ipfs://bafybeihze2e6pzygreosakvcemomkvorbtlqazdp2ovjx5qzxcalrt44lm"
                />
              </Box>
            </VStack>
          </Box>
        </Stack>
      </Layout>
    </>
  );
};

export default ClaimRuby;
