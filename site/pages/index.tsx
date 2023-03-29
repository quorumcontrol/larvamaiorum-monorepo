import {
  VStack,
  Text,
  Heading,
  Box,
  Stack,
  Button,
  Flex,
  Spacer,
  Link as ChakraLink
} from "@chakra-ui/react";
import type { NextPage } from "next";
import Image from "next/image";
import Layout from "../src/components/Layout";
import BadgeClaimCard from "../src/components/BadgeClaimCard";
import Carousel, { Slide } from "../src/components/Carousel";
import Link from "next/link";
import border from "../src/utils/dashedBorder";
import Video from "../src/components/Video";

import skaleLogo from "../assets/images/partners/Skale.png";
import boostVCLogo from "../assets/images/partners/BoostVC.png";
import gameTradeLogo from "../assets/images/partners/GameTradeMarket.png";
import iaVenturesLogo from "../assets/images/partners/IAVentures.png";
import initializedLogo from "../assets/images/partners/Initialized.png";

const boxPadding = ["0", "50px"];

const Home: NextPage = () => {
  return (
    <>
      <Layout>
        <VStack w="full" spacing="10">
          <Stack
            direction={["column", "row"]}
            p={boxPadding}
            w="full"
            overflow="hidden"
            align="start"
          >
            <Box>
              {" "}
              <Box maxW="25em">
                <Heading size={["lg", "xl"]}>
                  Empire Gambit is Coming.
                </Heading>
                <Text>
                  The ultimate fusion of an ancient strategy game and disruptive technology. Generative AI algorithms create a fun, dynamic, and immersive gameplay experience that changes every time you play.
                </Text>
              </Box>
              <ChakraLink href="https://empiregambit.com" target="_blank">
                <Button variant="primary" mt="10" px="1.5rem" py="2rem">
                  EARLY ACCESS
                </Button>
              </ChakraLink>
            </Box>
            <Spacer />
            <Box>
              <Box
                as="video"
                muted
                autoPlay
                loop
                preload="auto"
                playsInline
                controls
                data-setup="{}"
                w="600px"
                h="337px"
              >
                <source src="/video/empireGambitIntroduction.mp4" type="video/mp4" />
                <p className="vjs-no-js">
                  To view this video please enable JavaScript, and consider
                  upgrading to a web browser that supports HTML5 video
                </p>
              </Box>
            </Box>

          </Stack>

          <VStack alignItems="center" spacing={[1, 4]}>
            <Heading size={"lg"}>Our Partners</Heading>
            <Stack
              direction={["column", "row"]}
              spacing={[1, 4]}
            >
              <Box>
                <Image src={initializedLogo} alt="Initialized Capital logo" height="50px" objectFit="contain" />
              </Box>
              <Box>

                <Image src={gameTradeLogo} alt="GameTrade Market logo" height="50px" objectFit="contain" />
              </Box>

              <Box>

                <Image src={boostVCLogo} alt="Boost VC logo" height="50px" objectFit="contain" />
              </Box>

              <Box>

                <Image src={iaVenturesLogo} alt="IA Ventures logo" height="50px" objectFit="contain" />
              </Box>

              <Box>

                <Image src={skaleLogo} alt="SKALE logo" height="50px" objectFit="contain" />
              </Box>

            </Stack>
          </VStack>

          <Flex
            w="100%"
            overflow="hidden"
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
                <Heading size={["xl", "2xl"]}>Masks of the Ancients</Heading>
                <Text>
                  250 unique masks of tiered rarity entitle the purchaser to
                  mint a warrior or artifact. This NFT collection, available now
                  to wootgump holders, will premiere on the NFTrade platform
                  when it launches on SKALE.
                </Text>
                <Box>
                  <Link href="/masks">
                    <Button variant="primary" mt="10" px="1.5rem" py="2rem">
                      LEARN MORE
                    </Button>
                  </Link>
                </Box>
              </VStack>

              <Spacer />
              <Box>
                <Video
                  animationUrl="/video/masksOfTheAncientsPromo.mp4"
                  controls
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
                <Heading size={["xl", "2xl"]}>Delph&apos;s Table</Heading>
                <Text>
                  The Oracle of Delphi is worried you are not prepared to
                  support your warriors in the Arctic Jungle. He released a
                  mini-game to teach you about the dangers and the spoils of
                  warbanding.
                </Text>
                <Box>
                  <Link href="/delphs-table">
                    <Button variant="primary" mt="10" px="1.5rem" py="2rem">
                      PLAY NOW
                    </Button>
                  </Link>
                </Box>
              </VStack>

              <Spacer />
              <Box>
                <Video animationUrl="/video/delphsPromoVideo.mp4" controls />
              </Box>
            </Stack>
          </Flex>

          <Box
            w="100%"
            backgroundImage={["none", border]}
            alignItems="center"
            p={boxPadding}
            pb="50px"
          >
            <VStack maxW="22em" alignItems="left">
              <Heading size={["xl", "2xl"]}>Badge of Assembly</Heading>
              <Text>
                A badge qualifies you for airdrops, playing our mini-games,
                joining special discord channels and levels up your characters
                as your team does better. Collect them all if you can.
              </Text>
            </VStack>
            <Box mt="10">
              <Carousel slideCount={5}>
                <Slide>
                  <BadgeClaimCard
                    animationUrl="ipfs://bafybeihikpbbu27n5mwvbhp6h7kbxkly2lyg3omhpeth6sigzzbq7qtcqa"
                    name="GoodGhosting Genesis Badge"
                    description="Claimable if you participated in a finalised GoodGhosting game."
                    url="/badge-of-assembly/claim/good-ghosting"
                  />
                </Slide>
                <Slide>
                  <BadgeClaimCard
                    animationUrl="ipfs://bafybeignwce32es4mllodltf6jvdtr44pxxoqe7ysbf4ozoumhpd6d26iu"
                    name="NFT Club Berlin Genesis Badge"
                    description="Claimable by being a member of the NFT Club Berlin discord server."
                    url="/badge-of-assembly/claim/nft-club-berlin"
                  />
                </Slide>
                <Slide>
                  <BadgeClaimCard
                    animationUrl="ipfs://bafybeia7ngq2a2ch7my7ffub2vbcbdtffdbefitqjute7gdk7ul5xmb2w4"
                    name="Antiqui Posessor"
                    url="/badge-of-assembly/claim/antiqui"
                    description="Claimable with 1000 SKL on mainnet or a member of the classic game."
                  />
                </Slide>
                <Slide>
                  <BadgeClaimCard
                    animationUrl="ipfs://bafybeihze2e6pzygreosakvcemomkvorbtlqazdp2ovjx5qzxcalrt44lm"
                    name="Ruby Genesis"
                    url="/badge-of-assembly/claim/ruby"
                    description="Claimable by performing one transaction on the Europa network."
                  />
                </Slide>
                <Slide>
                  <BadgeClaimCard
                    animationUrl="ipfs://bafybeiefqqlksz3hx6r2omyga5l26caiupg32n6t752qkoinkg46fq2e7q"
                    name="SKALE Enjoyooor"
                    url="/badge-of-assembly/claim/enjoyooor"
                    description="Claimable by buying $SKL on Ruby.exchange within the last 3 days."
                  />
                </Slide>
              </Carousel>
            </Box>
          </Box>

          {/* <Flex
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
                <Heading size={["xl", "2xl"]}>Graphic Lore</Heading>
                <Text>
                  The story of how the alien, Ima, first discovered large $SKL
                  deposits in the arctic regions of Earth. Part I of this
                  graphic novella is minting page by page.
                </Text>
                <Box>
                  <Link href="/graphic-lore">
                    <Button variant="secondary" mt="10" px="1.5rem" py="2rem">
                      Read now
                    </Button>
                  </Link>
                </Box>
              </VStack>

              <Spacer />
              <Box mt="10">
                <Image src={historiaTitle} alt="Historia Colossei I: Cover" />
              </Box>
            </Stack>
          </Flex> */}
        </VStack>
      </Layout>
    </>
  );
};

export default Home;
