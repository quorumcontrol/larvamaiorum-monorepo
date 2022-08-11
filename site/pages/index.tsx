import {
  VStack,
  Text,
  Heading,
  Box,
  Stack,
  keyframes,
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
  `.trim()

  return (
    <>
      <Head>
        <title>Crypto Colosseum: Larva Maiorum</title>
        <meta name="description" content={description} />
        <meta property="og:title" content="Crypto Colosseum: Larva Maiorum" key="ogtitle" />
        <meta property="og:description" content={description} key="ogdesc" />

        <meta name="twitter:card" content="summary" key="twcard" />
        <meta name="twitter:creator" content="@larva_maiorum" key="twhandle" />

        <meta property="og:url" content="https://larvamaiorum.com" key="ogurl" />
        <meta property="og:image" content="/socialThumbnail.png" key="ogimage" />
        <meta property="og:image:alt" content="A 3D rendered gladiator holding an axe standing next to fire." key="og:image:alt" />
      </Head>
      <VideoModal isOpen={isOpen} onClose={onClose} />
      <Layout>
        <VStack mt="50" spacing={5}>
          <Heading
            as='h1'
            className="stroked"
            fontSize="54px"
            animation={easeInAnimation(0)}
            style={{textTransform: 'uppercase'}}
            textAlign='center'
          >
            <span style={{fontSize:'72px'}}>L</span>arva <span style={{fontSize:'72px'}}>M</span>aiorum
          </Heading>

          <Text textAlign="center" animation={easeInAnimation(1)}>
            1,111 Genesis Masks unleashed Q3 2022.
            <br />
            Only in the <Link href="https://skale.network/">SKALEverse</Link>. Prepare to SKALE.
          </Text>
          <Box p="3" rounded='10px' bg='blackAlpha.400'>
          <video
              id="full-video"
              // className="video-js vjs-theme-city"
              controls
              preload="auto"
              width="800"
              height="450"
              // poster="MY_VIDEO_POSTER.jpg"
              data-setup="{}"
            >
              <source src="/video/teaser-noComingSoon.mp4" type="video/mp4" />
              <source src="/video/teaser-noComingSoon.webm" type="video/webm" />
              <p className="vjs-no-js">
                To view this video please enable JavaScript, and consider
                upgrading to a web browser that supports HTML5 video
              </p>
            </video>
            </Box>
          {/* <Button fontSize={36} p={8} onClick={onWatchClick}>
            Watch
          </Button> */}
          <Stack spacing={10} direction={['column', 'row']}>
            <Link href="https://twitter.com/cryptocolosseum">Twitter</Link>
            <Link href="https://discord.gg/YrAwv2r5KA">Discord</Link>
            <Link href="https://t.me/crypto_colosseum">Telegram</Link>
          </Stack>
        </VStack>
      </Layout>
    </>
  );
};

export default Home;
