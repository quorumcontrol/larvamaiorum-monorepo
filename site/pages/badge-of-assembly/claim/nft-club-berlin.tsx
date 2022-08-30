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
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Layout from "../../../src/components/Layout";
import Video from "../../../src/components/Video";
import { useUserBadges } from "../../../src/hooks/BadgeOfAssembly";
import useIsClientSide from "../../../src/hooks/useIsClientSide";
import { isTestnet } from "../../../src/utils/networks";

const ClaimButton: React.FC<{
  address: string;
  onSuccess?: (txId?: string) => any;
}> = ({ address, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { error: err, transactionHash } = router.query;

  useEffect(() => {
    if (transactionHash && onSuccess) {
      onSuccess(transactionHash as string);
    }
  }, [transactionHash, onSuccess]);

  const onClaimClick = () => {
    setLoading(true);
    const redirectUri = isTestnet
      ? encodeURIComponent("https://larvammaiorumfaucetgjxd8a5h-nft-club-berlin-claim-testnet.functions.fnc.fr-par.scw.cloud")
      : encodeURIComponent("https://larvammaiorumfaucetgjxd8a5h-nft-club-berlin-claim-mainnet.functions.fnc.fr-par.scw.cloud");
    router.push(
      `https://discord.com/api/oauth2/authorize?client_id=1013803595759616080&redirect_uri=${redirectUri}&prompt=none&response_type=code&scope=guilds%20identify&state=${address}`
    );
  };

  if (loading) {
    return (
      <Box>
        <Spinner />
      </Box>
    );
  }

  return (
    <>
      <Button variant="primary" size="lg" onClick={onClaimClick}>
        Login to Discord to Claim
      </Button>
      {err && (
        <Box>
          <Text>Something went wrong. {err}</Text>
        </Box>
      )}
    </>
  );
};

const ClaimNftClubBerlin: NextPage = () => {
  const { address } = useAccount();
  const isDomReady = useIsClientSide();

  const [didMint, setDidMint] = useState(false);
  const { data: badgeList, isLoading: badgesLoading } = useUserBadges(address);

  useEffect(() => {
    if (!badgeList) {
      return;
    }
    if (badgeList.map((t) => t.id.toNumber()).includes(5)) {
      setDidMint(true);
    }
  }, [setDidMint, badgeList]);

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
        <meta name="description" content="Claim your NFT Club Berlin Genesis" />
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
        <Stack direction={["column", "row"]} spacing="10">
          <Box borderRadius="lg" borderWidth="1px" maxW="md" p="5">
            <VStack align="left" spacing="10">
              <Box>
                <Heading fontSize="3xl">Cost</Heading>
                <Text fontSize="md">Free!</Text>
              </Box>
              <Box>
                <Heading fontSize="3xl">Required to claim</Heading>
                <Text fontSize="md">
                  You are a member of the NFT Club Berlin discord.
                </Text>
              </Box>
              <Box>
                <Heading fontSize="3xl">Qualified?</Heading>
                <Text>Login to confirm membership.</Text>
              </Box>
              {!address && <Text>Connect wallet.</Text>}
              {address && (
                <ClaimButton
                  address={address}
                  onSuccess={() => setDidMint(true)}
                />
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
          <Box borderRadius="lg" borderWidth="1px" maxW="md" p="5">
            <VStack align="left" spacing="10">
              <Box>
                <Heading fontSize="3xl">NFT Club Berlin Genesis Badge</Heading>
              </Box>
              <Box>
                <Video
                  muted
                  autoPlay
                  loop
                  controls={false}
                  animationUrl="ipfs://bafybeignwce32es4mllodltf6jvdtr44pxxoqe7ysbf4ozoumhpd6d26iu"
                />
              </Box>
            </VStack>
          </Box>
        </Stack>
      </Layout>
    </>
  );
};

export default ClaimNftClubBerlin;
