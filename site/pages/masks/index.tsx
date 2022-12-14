import {
  VStack,
  Text,
  Heading,
  Box,
  Stack,
  Button,
  Flex,
  Spacer,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import Layout from "../../src/components/Layout";
import Link from "next/link";
import border from "../../src/utils/dashedBorder";
import Video from "../../src/components/Video";
import Head from "next/head";

const boxPadding = ["0", "50px"];

const MaskIndex: NextPage = () => {
  return (
    <>
      <Head>
        <title>Crypto Colosseum: Masks of the Ancients</title>
      </Head>
      <Layout>
        <VStack w="full" spacing="10">
          <Flex
            w="100%"
            borderBottom={["1px dashed", "none"]}
            borderBottomColor={"brand.orange"}
            alignItems="center"
            p={boxPadding}
            pb="50px"
          >
            <Stack
              direction={["column", "row"]}
              spacing="10"
              w="100%"
              alignItems="center"
            >
              <VStack maxW="22em" alignItems="left">
                <Heading size={["xl", "2xl"]}>Masks of the Ancients</Heading>
                <Text>
                  Wootgump infused masks allow the wearer to join the summoning ritual and bring forth an artifact or warrior to the Crypto Roman world.
                </Text>
              </VStack>
              <Spacer />

              <Box>
              <Video
                animationUrl="/video/maskWithVoiceOver.mp4"
                controls
                loop
                maxW={["90vw", "600px"]}
              />
              </Box>
            </Stack>
          </Flex>

          <Flex
            w="100%"
            backgroundImage={["none", border]}
            borderBottom={["1px dashed", "none"]}
            borderBottomColor={"brand.orange"}
            alignItems="center"
            p={boxPadding}
            pb="50px"
          >
            <Stack
              direction={["column", "row"]}
              spacing="10"
              w="100%"
              alignItems="center"
            >
              <VStack maxW="22em" alignItems="left">
                <Heading size={["xl", "2xl"]}>Where?</Heading>
                <Text>
                  Active on Delph&apos;s Table? Pre-mint masks for $GUMP 15,000
                  starting today.
                </Text>
                <Text>
                  Purchase the masks in other currencies as soon as NFTrade
                  launches on SKALE (soon).
                </Text>
                <Box>
                  <Link href="/masks/reserve">
                    <Button variant="primary" mt="10" px="1.5rem" py="2rem">
                      reserve now
                    </Button>
                  </Link>
                </Box>
              </VStack>

              <Spacer />
              <Box>
                <Video
                  animationUrl="/video/maskRapidFire.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  maxH="450px"
                />
              </Box>
            </Stack>
          </Flex>

          <Flex
            w="100%"
            backgroundImage={["none", border]}
            borderBottom={["1px dashed", "none"]}
            borderBottomColor={"brand.orange"}
            alignItems="center"
            p={boxPadding}
            pb="50px"
          >
            <Stack
              direction={["column", "row"]}
              spacing="10"
              w="100%"
              alignItems="center"
            >
              <VStack maxW="22em" alignItems="left">
                <Heading size={["xl", "2xl"]}>Summon</Heading>
                <Text>
                  Masks of the Ancients are minted with three rarities:
                  Uncommon, Rare, and Ultra-Rare.
                </Text>
                <Text>
                  Wear your mask to the summoning ritual to bring forth a
                  warrior or artifact of equal rarity. Each mask may only be
                  used once, but the art and PFP is yours forever.
                </Text>
              </VStack>

              <Spacer />
              <Box mt="10">
                <Video
                  animationUrl="/video/2-masks-rotating.mp4"
                  loop
                  muted
                  autoPlay
                  playsInline
                  maxW={["90vw", "600px"]}
                />
              </Box>
            </Stack>
          </Flex>
        </VStack>
      </Layout>
    </>
  );
};

export default MaskIndex;
