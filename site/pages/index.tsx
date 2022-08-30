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
import Layout from "../src/components/Layout";
import BadgeClaimCard from "../src/components/BadgeClaimCard";
import historiaTitle from "../assets/images/historiaTitle.png";
import historiaLocked from "../assets/images/historiaLocked.png";
import Carousel, { Slide } from "../src/components/Carousel";
import Link from "next/link";
import border from "../src/utils/dashedBorder";

const boxPadding = ["0", "50px"];

const Home: NextPage = () => {
  return (
    <>
      <Layout>
        <VStack w="full" spacing="10">
          <Flex
            p={boxPadding}
            pb="50px"
            position="relative"
            w="full"
            overflow="hidden"
          >
            <Box
              as="video"
              id="video-background"
              muted
              autoPlay
              loop
              preload="auto"
              playsInline
              data-setup="{}"
              display={["none", "block"]}
            >
              <source src="/video/teaserBackground.mp4" type="video/mp4" />
              <p className="vjs-no-js">
                To view this video please enable JavaScript, and consider
                upgrading to a web browser that supports HTML5 video
              </p>
            </Box>
            <Box>
              {" "}
              <Box maxW="25em">
                <Heading size={["lg", "xl"]}>
                  Become the most powerful and important warrior patron.
                  <br />
                  Welcome to Crypto Colosseum.
                </Heading>
                <Text>
                  Warrior patrons compete for power and prestige. Immerse
                  yourself in wootgump fueled adventures. Your earnings are only
                  capped by your skill. Crypto Rome is not a safe place.
                </Text>
              </Box>
              <Link href="https://discord.gg/Z2S3EtQKCn">
                <Button variant="primary" mt="10" px="1.5rem" py="2rem">
                  JOIN DISCORD
                </Button>
              </Link>
            </Box>
          </Flex>

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
                <Heading size={["xl", "2xl"]}>Larva Maiorum</Heading>
                <Text>
                  &quot;Masks of the Ancient Ones.&quot; A 1,111 Genesis mask
                  collection launching soon. This special collection entitles
                  the wearer to the absolute best game items at launch.
                  Gladiator warriors and ultra rare artifacts bless the wearer
                  of these wootgump infused masks.
                </Text>
              </VStack>

              <Spacer />
              <Box>
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

          <Box
            w="full"
            backgroundImage={["none", border]}
            borderBottom={["1px dashed", "none"]}
            borderBottomColor={"brand.orange"}
            alignItems="center"
            p={boxPadding}
            pb="50px"
          >
            <VStack maxW="22em" alignItems="left">
              <Heading size={["xl", "2xl"]}>Graphic Lore</Heading>
              <Text>
                The story of how the ancient aliens first discovered the large
                $SKL deposits in the arctic regions of earth. Part I of this
                graphic novella mints page-by-page starting September 1.
              </Text>
            </VStack>
            <Box mt="10">
              <Carousel slideCount={6}>
                <Slide>
                  <Image
                    src={historiaTitle}
                    alt="placeholder image for when the novel mints"
                  />
                </Slide>
                {new Array(5).fill(true).map((_, i) => {
                  return (
                    <Slide key={`historia-locked-${i}`}>
                      <Image
                        src={historiaLocked}
                        alt="placeholder image for when the novel mints"
                      />
                    </Slide>
                  );
                })}
              </Carousel>
            </Box>
          </Box>

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
                  <Button variant="primary" mt="10" px="1.5rem" py="2rem">
                    LEARN MORE
                  </Button>
                </Box>
              </VStack>

              <Spacer />
              <Box>
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
        </VStack>
      </Layout>
    </>
  );
};

export default Home;
