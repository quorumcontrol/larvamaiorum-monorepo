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
import Carousel, { Slide } from "../src/components/Carousel";
import border from "../src/utils/dashedBorder";
import historiaTitle from "../assets/images/historiaTitle.png";
import historiaLocked from "../assets/images/historiaLocked.png";
import cover from "../assets/images/lore/000_lore.jpg";

const boxPadding = ["0", "50px"];

const GraphicLore: NextPage = () => {
  return (
    <>
      <Layout>
        <VStack w="full" spacing="10">
          <Box
            w="full"
            backgroundImage={["none", border]}
            borderBottom={["1px dashed", "none"]}
            borderBottomColor={"brand.orange"}
            alignItems="center"
            p={boxPadding}
            pb="50px"
          >
            <Stack justifyContent="center" spacing="10" alignItems="center" direction={["column", "row"]}>
              <Image
                src={cover}
                width="373px"
                height="478px"
                alt="cover photo"
              />
              <Box>
                <Heading size={"xl"}>Lore Cover Page Mint</Heading>
                <Button variant="primary">Mint</Button>
                {/* <Text>
                  The story of how the ancient aliens first discovered the large
                  $SKL deposits in the arctic regions of earth. Part I of this
                  graphic novella mints page-by-page.
                </Text> */}
              </Box>
            </Stack>
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
        </VStack>
      </Layout>
    </>
  );
};

export default GraphicLore;
