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
import Link from "next/link";
import { useCallback, useState } from "react";
import VideoModal from "../src/components/VideoModal";
import Layout from "../src/components/Layout";

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
                Welcome to crypto rome.
              </Heading>
              <Text>
                Warrior patrons compete for power and prestige. Immerse yourself
                in wootgump fueled adventures. Your earnings are only capped by
                your skill.
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
                  Masks of the<br />Ancient ones
                </Heading>
                <Text>
                  1,111 Genesis masks launching Q3 2022. Only in the SKALEverse.
                  This special collection entitles the wearer to the absolute best game items at launch.
                  Gladiator warriors and ultra rare artifacts bless the wearer of these wootgump infused masks.
                </Text>
              </VStack>

              <Spacer />
              <Box border="solid" h="300px" w="500px"></Box>
            </Stack>
          </Flex>
        </VStack>
      </Layout>
    </>
  );
};

export default Home;
