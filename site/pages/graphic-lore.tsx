import {
  VStack,
  Text,
  Heading,
  Box,
  Stack,
  Button,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import { useState } from "react";
import Image from "next/image";
import { useAccount } from "wagmi";
import Layout from "../src/components/Layout";
import Carousel, { Slide } from "../src/components/Carousel";
import border from "../src/utils/dashedBorder";
import historiaLocked from "../assets/images/historiaLocked.png";
import { useLore } from "../src/hooks/useLore";
import { isTestnet } from "../src/utils/networks";
import cover from "../assets/images/lore/000_lore.jpg";
import page1 from "../assets/images/lore/001_lore.jpg";
import page2 from "../assets/images/lore/002_lore.jpg";
import page3 from "../assets/images/lore/003_lore.jpg";
import page4 from "../assets/images/lore/004_lore.jpg";
import page5 from "../assets/images/lore/005_lore.jpg";

const boxPadding = ["0", "50px"];

//TODO: hacky - fix
const mintUrl = isTestnet
  ? "https://larvammaiorumfaucetgjxd8a5h-loreminter-testnet.functions.fnc.fr-par.scw.cloud"
  : "https://larvammaiorumfaucetgjxd8a5h-loreminter-mainnet.functions.fnc.fr-par.scw.cloud";

const images: Record<string, typeof cover> = {
  "0": cover,
  "1": page1,
  "2": page2,
  "3": page3,
  "4": page4,
  "5": page5,
};

const GraphicLore: NextPage = () => {
  const { address } = useAccount();
  const {
    userLore: { data: userBalance },
    loreTokens,
    todays,
  } = useLore(address);
  console.log("user balance: ", userBalance);

  const [currentToken, setCurrentToken] = useState(todays.id);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [didMint, setDidMint] = useState(false);
  const [modalOpen, setModalOpen] = useState(true);
  const token = loreTokens[currentToken];

  const onMint = async () => {
    try {
      setLoading(true);
      const resp = await fetch(mintUrl, {
        method: "post",
        body: JSON.stringify({
          address,
          tokenId: token.id,
        }),
      });
      if (resp.status !== 201) {
        const { error } = await resp.json();
        return setErr(`Something went wrong: ${error}`);
      }
      setDidMint(true);
    } catch (err: any) {
      console.error(err);
      setErr(err.toString());
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const MintButton = () => {
    if (didMint) {
      return <Text>Nice.</Text>;
    }
    if (!userBalance || loading) {
      return <Spinner />;
    }

    if (userBalance[currentToken].gt(0)) {
      return <Text>Already minted.</Text>;
    }
    if (token.available) {
      return (
        <Box>
          <Button variant="primary" onClick={onMint}>
            Mint
          </Button>
          <Text>{err}</Text>
        </Box>
      );
    }
    return <Text>Minting {token.startDate.toLocaleString()} </Text>;
  };

  return (
    <>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} scrollBehavior="outside" size="full">
        <ModalOverlay />
        <ModalContent alignItems="center" onClick={() => setModalOpen(false)}>
          <ModalCloseButton />
          <ModalBody w="940px" h="1220px">
            <Image
              src={images[currentToken]}
              alt={`${token.name}`}
              width="900px"
              objectFit="contain"
            />
          </ModalBody>
        </ModalContent>
      </Modal>
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
              <Box cursor="zoom-in" onClick={() => setModalOpen(true)}>
                <Image
                  src={images[currentToken]}
                  width="373px"
                  height="478px"
                  alt={token.name}
                />
              </Box>
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
                        <Box
                          backgroundImage="/frame.png"
                          backgroundRepeat={"no-repeat"}
                          cursor="pointer"
                          p="4"
                          h="398px"
                          w="300px"
                          onClick={() => {
                            setDidMint(false);
                            setCurrentToken(token.id);
                          }}
                        >
                          <Image
                            src={images[token.id]}
                            alt={`${token.name}`}
                            height="390px"
                            width="255px"
                            objectFit="contain"
                          />
                        </Box>
                      )}
                      {!token.viewable && (
                        <Image
                          src={historiaLocked}
                          alt={`Locked: ${token.name}`}
                        />
                      )}
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
