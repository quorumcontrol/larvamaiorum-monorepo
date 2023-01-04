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
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { useAccount, useWaitForTransaction } from "wagmi";
import Layout from "../../../src/components/Layout";
import Video from "../../../src/components/Video";
import { useUserBadges } from "../../../src/hooks/BadgeOfAssembly";
import useIsClientSide from "../../../src/hooks/useIsClientSide";
import { HexString } from "../../../src/utils/hexType";
import { defaultNetwork } from "../../../src/utils/SkaleChains";

const ClaimButton: React.FC<{
  address: string;
  onSuccess?: (txId?: string) => any;
}> = ({ address, onSuccess }) => {
  const [transactionId, setTransactionId] = useState("");
  const [err, setErr] = useState<string | undefined>(undefined);
  
  const mutation = useMutation<Response, unknown, { address: string }, unknown>(
    "claim-goodghosting-badge",
    ({ address  }) => {
      console.log("claiming good ghosting genesis for ", address)
      return fetch("https://larvammaiorumfaucetgjxd8a5h-goodghosting-claim.functions.fnc.fr-par.scw.cloud", {
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
    hash: transactionId as HexString,
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

const ClaimGoodGhosting: NextPage = () => {
  const { address } = useAccount();
  const isDomReady = useIsClientSide();

  const { data: eligible, isFetched } = useQuery(
    ['isGoodGhostingEligible', address], 
    async () => {
      const resp = await fetch('https://larvammaiorumfaucetgjxd8a5h-goodghosting-eligible.functions.fnc.fr-par.scw.cloud', {
        method: 'POST',
        body: JSON.stringify({ address })
      })
      const parsed = await resp.json()
      return parsed.eligible
    }, {
      enabled: !!address,
    })

  const [didMint, setDidMint] = useState(false);
  const { data:badgeList, isLoading: badgesLoading } = useUserBadges(address)

  useEffect(() => {
    if (!badgeList) {
      return
    }
    if (badgeList.map((t) => t.id.toNumber()).includes(4)) {
      setDidMint(true)
    }
  }, [setDidMint, badgeList])

  if (!isDomReady || badgesLoading) {
    return (
      <>
        <Head>
          <title>Badge of Assembly: Claim GoodGhosting Genesis</title>
          <meta name="description" content="Claim your Good Ghosting badge" />
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
              playsInline
              animationUrl="ipfs://bafybeiga753hvhewysosiv3yb2nwo65tcxj46sq5gb5ownb7a7fulzuw5e"
            />
          </Box>
          <Text>
            Your badge is in your wallet. See it on{" "}
            {isDomReady && address && (
              <Link href={`/profile/${address}`} textDecoration="underline">
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
        <meta name="description" content="Claim your GoodGhosting Genesis" />
      </Head>
      <Video
        animationUrl="ipfs://bafybeiehqfim6ut4yzbf5d32up7fq42e3unxbspez7v7fidg4hacjge5u4"
        loop
        muted
        autoPlay
        playsInline
        id="jungle-video-background"
      />
      <Layout>
        <Stack direction={['column', 'row']} spacing='10'>
          <Box
            borderRadius="lg"
            borderWidth="1px"
            maxW="md"
            p="5"
          >
            <VStack align="left" spacing="10">
              <Box>
                <Heading fontSize="3xl">Cost</Heading>
                <Text fontSize="md">Free!</Text>
              </Box>
              <Box>
                <Heading fontSize="3xl">Required to claim</Heading>
                <Text fontSize="md">You participated in a finalised GoodGhosting game.</Text>
              </Box>
              <Box>
                <Heading fontSize="3xl">Qualified?</Heading>
                {!isFetched && <Spinner />}
                {isFetched && <Text fontSize="md">{eligible ? "Yes" : "No"}</Text>}
              </Box>

              {eligible && isFetched && address && (
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
            maxW="md"
            p="5"
          >
            <VStack align="left" spacing="10">
              <Box>
                <Heading fontSize="3xl">GoodGhosting Genesis Badge</Heading>
              </Box>
              <Box>
                <Video
                  muted
                  autoPlay
                  loop
                  controls={false}
                  animationUrl="ipfs://bafybeihikpbbu27n5mwvbhp6h7kbxkly2lyg3omhpeth6sigzzbq7qtcqa"
                />
              </Box>
            </VStack>
          </Box>
        </Stack>
      </Layout>
    </>
  );
};

export default ClaimGoodGhosting;
