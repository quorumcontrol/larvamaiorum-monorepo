import {
  Button,
  Spinner,
  Text,
  Box,
  Stack,
  Heading,
  VStack,
  Link,
  FormControl,
  FormLabel,
  Input,
  FormHelperText,
  FormErrorMessage,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import { BigNumber } from 'ethers'
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import Layout from "../../../../src/components/Layout";
import Video from "../../../../src/components/Video";
import {
  useBadgeMetadata,
  useUserBadges,
} from "../../../../src/hooks/BadgeOfAssembly";
import useIsClientSide from "../../../../src/hooks/useIsClientSide";
import { isTestnet } from "../../../../src/utils/networks";

const mintAPI = isTestnet ? 
  "/api/local/codeMinter" : 
  "https://larvammaiorumfaucetgjxd8a5h-codeminter-mainnet.functions.fnc.fr-par.scw.cloud"

const CodeClaimer: NextPage = () => {
  const { address } = useAccount();
  const isDomReady = useIsClientSide();
  const router = useRouter();
  const { tokenId: untypedTokenId } = router.query;
  const tokenId: string | undefined = untypedTokenId as string | undefined;
  const { data: metadata, isLoading } = useBadgeMetadata(tokenId);
  const [code, setCode] = useState('')
  const [err, setErr] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async () => {
    try {
      setSubmitting(true)
      if (!code) {
        return setErr('You must enter a code.')
      }
      if (!tokenId || !address) {
        return setErr('something went wrong, missing tokenId or address.')
      }
      const resp = await fetch(mintAPI, {
        method: "POST",
        body: JSON.stringify({
          address,
          code: code.trim(),
          tokenId: BigNumber.from(tokenId).toNumber(),
        })
      })
      if (resp.status !== 201) {
        const { error } = await resp.json()
        return setErr(error)
      }

      // success
      setDidMint(true)

    } catch (err:any) {
      setErr(err.toString())
    } finally {
      setSubmitting(false)
    }

  }

  const [didMint, setDidMint] = useState(false);
  const { data: badgeList, isLoading: badgesLoading } = useUserBadges(address);

  const loading = isLoading || !metadata || badgesLoading

  useEffect(() => {
    if (!badgeList || !tokenId) {
      return;
    }
    if (badgeList.map((t) => t.id.toNumber()).includes(parseInt(tokenId, 10))) {
      setDidMint(true);
    }
  }, [setDidMint, badgeList, tokenId]);

  if (!isDomReady || loading) {
    return (
      <>
        <Head>
          <title>Badge of Assembly: Claim</title>
          <meta name="description" content="Claim your badge" />
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
        <meta name="description" content="Claim your Badge of Assembly" />
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
                <Text fontSize="md">You hold the secret code.</Text>
              </Box>
              <Box>
                <Heading fontSize="3xl">Code</Heading>
                <FormControl isRequired isDisabled={loading} isInvalid={!!err}>
                  <FormLabel htmlFor="code">
                    Secret Code
                  </FormLabel>
                  <Input id="code" type="text" value={code} onChange={(evt) => setCode(evt.target.value) }/>
                  <FormHelperText>The code you were given.</FormHelperText>
                  <FormErrorMessage>{err}</FormErrorMessage>
                </FormControl>
                { submitting && (<Spinner />) }
                {address && <Button variant="primary" disabled={!!address && !code && !submitting} onClick={onSubmit}>Claim</Button>}
              </Box>

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
                <Heading fontSize="3xl">{metadata.name}</Heading>
              </Box>
              <Box>
                <Video
                  muted
                  autoPlay
                  loop
                  controls={false}
                  animationUrl={metadata.animationUrl}
                />
              </Box>
            </VStack>
          </Box>
        </Stack>
      </Layout>
    </>
  );
};

export default CodeClaimer;
