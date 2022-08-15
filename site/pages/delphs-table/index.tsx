import { VStack, Text, Heading, Box } from "@chakra-ui/react";
import type { NextPage } from "next";
import Layout from "../../src/components/Layout";

const Home: NextPage = () => {
  return (
    <>
      <Layout>
        <VStack spacing={5} alignItems="left">
          <Box maxW="40rem">
            <Heading size={["xl", "2xl"]}>Delph&apos;s Table</Heading>
            <Text>
              Find the Wootgump, don&apos;t get rekt. Delph&apos;s Table is
              multiplayer game with rewards from prize pools to NFT drops.
            </Text>
            <Text>Launching 7 September, 2022</Text>
          </Box>

          <Box p="3" rounded="10px" bg="blackAlpha.400">
            <video
              id="full-video"
              controls
              preload="auto"
              width="800"
              height="450"
              data-setup="{}"
            >
              <source src="/video/delphsPromoVideo.mp4" type="video/mp4" />
              <p className="vjs-no-js">
                To view this video please enable JavaScript, and consider
                upgrading to a web browser that supports HTML5 video
              </p>
            </video>
          </Box>
        </VStack>
      </Layout>
    </>
  );
};

export default Home;
