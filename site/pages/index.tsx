import {
  VStack,
  Text,
  Heading,
  Box,
  Stack,
  keyframes,
  Button,
  Flex,
  HStack,
  Spacer,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useCallback, useState } from "react";
import VideoModal from "../src/components/VideoModal";
import Layout from "../src/components/Layout";
import placeHolderHistoria from "../assets/images/placeHolderHistoria.png";
import BadgeClaimCard from "../src/components/BadgeClaimCard";

const Home: NextPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const onClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const translate = keyframes`
  from {transform: translateY(100px)}
  to {transform: translateY(0)}
`;
  const fade = keyframes`
  from {opacity: 0}
  to {opacity: 1}
`;

  const easeInAnimation = (order = 0) => {
    const offset = 4 * order;
    return `${translate} 1.${offset}s 0s ease-in-out, ${fade} 4.${offset}s 0s ease-in-out`;
  };

  const description = `
  1,111 Genesis masks launching Q3 2022. Only in the SKALEverse. Crypto Colosseum: Larva Maiorum is a play2earn blockchain game set in crypto-rome. Battle your warriors, equip your recruits, craft NFT items.
  `.trim();

  return (
    <>
      <Head>
        <title>Crypto Colosseum: Larva Maiorum</title>
        <meta name="description" content={description} />
        <meta
          property="og:title"
          content="Crypto Colosseum: Larva Maiorum"
          key="ogtitle"
        />
        <meta property="og:description" content={description} key="ogdesc" />

        <meta name="twitter:card" content="summary" key="twcard" />
        <meta name="twitter:creator" content="@larva_maiorum" key="twhandle" />

        <meta
          property="og:url"
          content="https://larvamaiorum.com"
          key="ogurl"
        />
        <meta
          property="og:image"
          content="/socialThumbnail.png"
          key="ogimage"
        />
        <meta
          property="og:image:alt"
          content="A 3D rendered gladiator holding an axe standing next to fire."
          key="og:image:alt"
        />
      </Head>
      <VideoModal isOpen={isOpen} onClose={onClose} />
      <Layout>
        <VStack w="100%" spacing="10">
          <Box
            p="50px"
            position="relative"
            w="100%"
            overflow="hidden"
            minH="800px"
          >
            <video
              id="video-background"
              // controls
              muted
              autoPlay
              loop
              preload="auto"
              // width="640"
              // height="264"
              // poster="MY_VIDEO_POSTER.jpg"
              data-setup="{}"
            >
              <source src="/video/teaserBackground.mp4" type="video/mp4" />
              <p className="vjs-no-js">
                To view this video please enable JavaScript, and consider
                upgrading to a web browser that supports HTML5 video
              </p>
            </video>
            <Box maxW="25em" mt="150px">
              <Heading textTransform="uppercase">
                Become the most powerful and important warrior patron.
                <br />
                Welcome to Crypto Colosseum.
              </Heading>
              <Text>
                Warrior patrons compete for power and prestige. Immerse yourself
                in wootgump fueled adventures. Your earnings are only capped by
                your skill. Crypto Rome is not a safe place.
              </Text>
            </Box>
            <Button variant="primary" mt="10" px="1.5rem" py="2rem">
              JOIN DISCORD
            </Button>
          </Box>

          <Flex
            border="dashed"
            w="100%"
            overflow="hidden"
            minH="800px"
            borderColor="brand.orange"
            borderWidth="1px"
            alignItems="center"
            p="50px"
          >
            <Stack
              direction={["column", "row"]}
              spacing="5"
              w="100%"
              alignItems="center"
            >
              <VStack maxW="22em" alignItems="left">
                <Heading textTransform="uppercase" size="2xl">
                  Masks of the
                  <br />
                  Ancient ones
                </Heading>
                <Text>
                  1,111 Genesis masks launching Q3 2022. Only in the SKALEverse.
                  This special collection entitles the wearer to the absolute
                  best game items at launch. Gladiator warriors and ultra rare
                  artifacts bless the wearer of these wootgump infused masks.
                </Text>
              </VStack>

              <Spacer />
              <Box h="300px" w="600px">
                <video
                  id="full-video"
                  controls
                  preload="auto"
                  width="100%"
                  height="100%"
                  data-setup="{}"
                >
                  <source
                    src="/video/teaser-noComingSoon.mp4"
                    type="video/mp4"
                  />
                  <source
                    src="/video/teaser-noComingSoon.webm"
                    type="video/webm"
                  />

                  <p className="vjs-no-js">
                    To view this video please enable JavaScript, and consider
                    upgrading to a web browser that supports HTML5 video
                  </p>
                </video>
              </Box>
            </Stack>
          </Flex>

          <Flex
            border="dashed"
            w="100%"
            overflow="hidden"
            minH="800px"
            borderColor="brand.orange"
            borderWidth="1px"
            p="50px"
          >
            <VStack alignItems="left" spacing="10">
              <VStack maxW="22em" alignItems="left">
                <Heading textTransform="uppercase" size="2xl">
                  Graphic Lore
                </Heading>
                <Text>
                  The story of how the ancient aliens first discovered the large
                  $SKL deposits in the arctic regions of earth.
                </Text>
                <Text>
                  Part I of this graphic novella will mint page-by-page starting
                  September 1.
                </Text>
              </VStack>
              <HStack>
                <Image
                  src={placeHolderHistoria}
                  alt="placeholder image for when the novel mints"
                />
              </HStack>
            </VStack>
          </Flex>

          <Flex
            border="dashed"
            w="100%"
            overflow="hidden"
            minH="800px"
            borderColor="brand.orange"
            borderWidth="1px"
            alignItems="center"
            p="50px"
          >
            <Stack
              direction={["column", "row"]}
              spacing="5"
              w="100%"
              alignItems="center"
            >
              <VStack maxW="22em" alignItems="left">
                <Heading textTransform="uppercase" size="2xl">
                  Delph&apos;s Table
                </Heading>
                <Text>
                  The Oracle of Delphi is worried you are not prepared to
                  support your warriors in the Arctic Jungle. He released a
                  mini-game to teach you about the dangers and the spoils of
                  warbanding.
                </Text>
                <Box>
                  <Button variant="primary" mt="10" px="1.5rem" py="2rem">
                    LEARN MORE
                  </Button>
                </Box>
              </VStack>

              <Spacer />
              <Box h="300px" w="600px">
                <video
                  id="full-video"
                  controls
                  preload="auto"
                  width="100%"
                  height="100%"
                  data-setup="{}"
                >
                  <source src="/video/delphsPromoVideo.mp4" type="video/mp4" />

                  <p className="vjs-no-js">
                    To view this video please enable JavaScript, and consider
                    upgrading to a web browser that supports HTML5 video
                  </p>
                </video>
              </Box>
            </Stack>
          </Flex>

          <Flex
            border="dashed"
            w="100%"
            overflow="hidden"
            minH="800px"
            borderColor="brand.orange"
            borderWidth="1px"
            p="50px"
          >
            <VStack alignItems="left" spacing="10">
              <VStack maxW="22em" alignItems="left">
                <Heading textTransform="uppercase" size="2xl">
                  Graphic Lore
                </Heading>
                <Text>
                  The story of how the ancient aliens first discovered the large
                  $SKL deposits in the arctic regions of earth.
                </Text>
                <Text>
                  Part I of this graphic novella will mint page-by-page starting
                  September 1.
                </Text>
              </VStack>
              <HStack overflowX="scroll" spacing="10">
                <BadgeClaimCard
                  animationUrl="ipfs://bafybeia7ngq2a2ch7my7ffub2vbcbdtffdbefitqjute7gdk7ul5xmb2w4"
                  name="Antiqui Posessor"
                  url="/badge-of-assembly/claim/antiqui"
                  description="Claimable with 1000 SKL on mainnet or a member of the classic game."
                />
                <BadgeClaimCard
                  animationUrl="ipfs://bafybeihze2e6pzygreosakvcemomkvorbtlqazdp2ovjx5qzxcalrt44lm"
                  name="Ruby Genesis"
                  url="/badge-of-assembly/claim/ruby"
                  description="Claimable by performing one transaction on the Europa network."
                />
                <BadgeClaimCard
                  animationUrl="ipfs://bafybeiefqqlksz3hx6r2omyga5l26caiupg32n6t752qkoinkg46fq2e7q"
                  name="SKALE Enjoyooor"
                  url="/badge-of-assembly/claim/enjoyooor"
                  description="Claimable by buying $SKL on Ruby.exchange within the last 3 days."
                />
              </HStack>
            </VStack>
          </Flex>
        </VStack>
      </Layout>
    </>
  );
};

export default Home;
