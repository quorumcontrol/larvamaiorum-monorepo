import {
  Button,
  Spinner,
  Text,
  Box,
  Stack,
  Heading,
  VStack,
  Link,
  HStack,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import Head from "next/head";
import NextLink from "next/link";
import { useState } from "react";
import { useMutation } from "react-query";
import { useAccount, useWaitForTransaction } from "wagmi";
import Layout from "../../../src/components/Layout";
import Video from "../../../src/components/Video";
import { useHasPudgy } from "../../../src/hooks/badgeOfAssembly/useHasPudgy";
import useIsClientSide from "../../../src/hooks/useIsClientSide";
import { isTestnet } from "../../../src/utils/networks";
import { defaultNetwork } from "../../../src/utils/SkaleChains";

const mintUrl = isTestnet ? "/api/local/badge-of-assembly/claimor" : "https://larvammaiorumfaucetgjxd8a5h-claimor-mainnet.functions.fnc.fr-par.scw.cloud";
const tokenId = 11;

const ClaimButton: React.FC<{
  address: string;
  onSuccess?: (txId?: string) => any;
}> = ({ address, onSuccess }) => {
  const [transactionId, setTransactionId] = useState("");
  const [err, setErr] = useState<string | undefined>(undefined);

  const mutation = useMutation<Response, unknown, { address: string }, unknown>(
    "claim-badge",
    ({ address }) => {
      console.log("fetching: ", tokenId, "for", address);
      return fetch(mintUrl, {
        body: JSON.stringify({ address, tokenId }),
        method: "post",
      });
    },
    {
      onSuccess: async (resp) => {
        console.log(resp);
        if (resp.status !== 201) {
          try {
            const { error } = await resp.json();
            console.error("error: ", error);
            setErr(`Something went wrong: ${error}`);
          } catch (err) {
            setErr("Something went wrong");
          }
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
        setErr("transaction failed");
        return;
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
        <Text>something went wrong. {err}</Text>
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

const ClaimPenguin: NextPage = () => {
  const { address } = useAccount();
  const isDomReady = useIsClientSide();

  const { data: isPudgyHolder, isFetched } = useHasPudgy(address);

  const [didMint, setDidMint] = useState(false);

  if (!isDomReady) {
    return (
      <>
        <Head>
          <title>Badge of Assembly: Claim Avis Pinguinus</title>
          <meta
            name="description"
            content="Claim your Avis Pinguinus
 badge"
          />
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
              <Link href={`/profile/${address}`} textDecoration="underline">
                your personal page.
              </Link>
            )}
          </Text>
          <Heading>Utility</Heading>
          <HStack>
            <NextLink href="/delphs-table">
              <Button>Play Delph&apos;s Table</Button>
            </NextLink>
          </HStack>
        </VStack>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Badge of Assembly: Claim</title>
        <meta name="description" content="Claim your Avis Pinguinus" />
      </Head>
      <Layout>
        <Video
          animationUrl="ipfs://bafybeiehqfim6ut4yzbf5d32up7fq42e3unxbspez7v7fidg4hacjge5u4"
          loop
          muted
          autoPlay
          playsInline
          id="jungle-video-background"
        />
        <Stack direction={["column", "row"]} spacing="10">
          <Box borderRadius="lg" borderWidth="1px" maxW="md" p="7">
            <VStack align="left" spacing="10">
              <Box>
                <Heading fontSize="xl">Cost</Heading>
                <Text>Free!</Text>
              </Box>
              <Box>
                <Heading fontSize="xl">Required to claim</Heading>
                <Text>You have a cute penguin jpeg (or rog).</Text>
              </Box>
              <Box>
                <Heading fontSize="xl">Qualified?</Heading>
                {!isFetched && <Spinner />}
                {isFetched && <Text>{isPudgyHolder ? "Yes" : "No"}</Text>}
              </Box>

              {isFetched && isPudgyHolder && address && (
                <Box>
                  <ClaimButton
                    address={address}
                    onSuccess={() => setDidMint(true)}
                  />
                </Box>
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
          <Box borderRadius="lg" borderWidth="1px" maxW="md" p="7">
            <VStack align="left" spacing="10">
              <Box>
                <Heading>Avis Pinguinus</Heading>
                <Text>Rog. Rog. Lil. Rog.</Text>
              </Box>
              <Box>
                <Video
                  muted
                  autoPlay
                  loop
                  controls={false}
                  animationUrl="ipfs://bafybeia2vka5qole3c7nwlxygfthjrc2mwmdeesnndjiatztjbxgdd2uzm"
                />
              </Box>
            </VStack>
          </Box>
        </Stack>
      </Layout>
    </>
  );
};

export default ClaimPenguin;
