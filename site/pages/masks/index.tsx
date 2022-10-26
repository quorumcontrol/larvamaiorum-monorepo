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
import Image from "next/image";
import Layout from "../../src/components/Layout";
import BadgeClaimCard from "../../src/components/BadgeClaimCard";
import historiaTitle from "../../assets/images/historiaTitle.png";
import Carousel, { Slide } from "../../src/components/Carousel";
import Link from "next/link";
import border from "../../src/utils/dashedBorder";
import Video from "../../src/components/Video";

const boxPadding = ["0", "50px"];

const MaskIndex: NextPage = () => {
  return (
    <>
      <Layout>
        <VStack w="full" spacing="10">
          <Flex w="100%" maxH="450px" alignItems="center" bgColor="black">
              <Video
                animationUrl="/video/largerMask-masksOfAncients.mp4"
                controls
                autoPlay
                playsInline
                loop
                maxH="450px"
              />
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
                <Heading size={["xl", "2xl"]}>Summoning Power</Heading>
                <Text>
                  Wear your mask to the summoning ritual to bring forth a warrior or artifact of equal rarity.
                </Text>
              </VStack>

              <Spacer />
              <Box mt="10">
                <Video animationUrl="/video/2-masks-rotating.mp4" loop muted autoPlay playsInline />
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
                <Heading size={["xl", "2xl"]}>Active on Delph&apos;s?</Heading>
                <Text>
                  Pre-mint masks for $GUMP 15,000 starting today.
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
                <Video animationUrl="/video/maskRapidFire.mp4" autoPlay loop muted playsInline maxH="450px" />
              </Box>
            </Stack>
          </Flex>
        </VStack>
      </Layout>
    </>
  );
};

export default MaskIndex;