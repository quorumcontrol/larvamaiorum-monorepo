import {
  VStack,
  Text,
  Heading,
  Box,
  Stack,
  Button,
  Spinner,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import Image from "next/image";
import Layout from "../src/components/Layout";
import Carousel, { Slide } from "../src/components/Carousel";
import border from "../src/utils/dashedBorder";
import historiaLocked from "../assets/images/historiaLocked.png";
import { useAccount } from "wagmi";
import { useLore } from "../src/hooks/useLore";
import { useState } from "react";

const boxPadding = ["0", "50px"];

const GraphicLore: NextPage = () => {
  const { address } = useAccount();
  const {
    userLore: { data: userBalance, isLoading },
    loreTokens,
    todays,
  } = useLore(address);

  const [currentToken, setCurrentToken] = useState(todays.id);
  const token = loreTokens[currentToken];

  const MintButton = () => {
    if (!userBalance) {
      return <Spinner />;
    }
    console.log("user balance: ", userBalance);
    if (userBalance[currentToken].gt(0)) {
      return <Text>Already minted.</Text>;
    }
    if (token.available) {
      return <Button variant="primary">Mint</Button>;
    }
    return <Text>Minting {token.startDate.toLocaleString()} </Text>;
  };

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
            <Stack
              justifyContent="center"
              spacing="10"
              alignItems="center"
              direction={["column", "row"]}
            >
              <Image
                src={token.image}
                width="373px"
                height="478px"
                alt="cover photo"
              />
              <Box>
                <Heading size={["lg", "xl"]}>
                  {loreTokens[currentToken].name}
                </Heading>
                <MintButton />
              </Box>
            </Stack>
            <Box mt="10">
              <Carousel slideCount={Object.values(loreTokens).length}>
                {Object.values(loreTokens).map((token) => {
                  return (
                    <Slide key={`lore-careousel-token-${token.id}`}>
                      {token.viewable && (
                        <Box backgroundImage="/frame.png" backgroundRepeat={"no-repeat"} p="4" h="398px" w="300px" onClick={() => setCurrentToken(token.id)}>
                          <Image src={token.image} alt={`${token.name}`} height="390px" width="255px" objectFit="contain" />
                        </Box>
                      )}
                      {!token.viewable && (
                        <Image
                          src={historiaLocked}
                          alt={`Locked: ${token.name}`}
                        />
                      )}
                    </Slide>
                  )
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
