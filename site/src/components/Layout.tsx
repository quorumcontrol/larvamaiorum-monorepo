import React, { useEffect, useState } from "react";
import {
  Container,
  VStack,
  Box,
  Text,
  Link,
  Spinner,
  HStack,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import topologyImage from "../../assets/images/topology.svg";
import Navigation from "./Navigation";
import { SocialIcon } from 'react-social-icons';
import { useAccount } from "wagmi";
import { useUsername } from "../hooks/Player";
import SignupModal from "./SignupModal";


const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { address, isConnected, isConnecting } = useAccount()
  const { data:username, isLoading, isFetched } = useUsername(address)
  const [navigating, setNavigating] = useState(false);
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    const handleStart = (url: string) =>
      url !== router.asPath && setNavigating(true);
    const handleComplete = (url: string) =>
      url === router.asPath && setNavigating(false);

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router]);

  useEffect(() => {
    setModalOpen(isConnected && isFetched && !username)
  }, [setModalOpen, isConnected, isFetched, username])

  const showSpinner = navigating || isConnecting || isLoading

  return (
    <>
      <Box
        position="absolute"
        top="0"
        left="0"
        zIndex={-1}
        backgroundImage={topologyImage.src}
        height={topologyImage.height}
        width={topologyImage.width}
        opacity="0.7"
        overflow="hidden"
        maxW="100vw"
      />
      <SignupModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      <Container p={10} maxW="1400" zIndex={1}>
        <Navigation />

        <VStack mt="10" spacing={5} alignItems="left">
          {showSpinner && <Spinner />}
          {!showSpinner && children}
        </VStack>
        <VStack as="footer" mt="200" textAlign="center" alignItems="center">
          <HStack>
            <SocialIcon url="https://twitter.com/larva_maiorum" />
            <SocialIcon url="https://discord.gg/tTSNvAuK" />
            <SocialIcon url="https://t.me/crypto_colosseum" />
          </HStack>
          <Text fontSize="sm">
            A Crypto Colosseum: Larva Maiorum experience.
          </Text>
          <Text pt="4" fontSize="12px">
            &copy; 2022 Quorum Control GmbH
          </Text>
        </VStack>
      </Container>
    </>
  );
};

export default Layout;
