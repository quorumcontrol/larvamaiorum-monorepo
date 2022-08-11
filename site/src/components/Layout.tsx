import React, { useEffect, useState } from "react";
import {
  Container,
  VStack,
  Box,
  Heading,
  Stack,
  Spacer,
  Text,
  Link,
  LinkBox,
  LinkOverlay,
  Spinner,
} from "@chakra-ui/react";
import Image from "next/image";
import NextLink from "next/link";
import logo from "../../assets/images/logo.svg";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import useIsClientSide from "../hooks/useIsClientSide";
import { useUsername } from "../hooks/Player";
import { useAccount } from "wagmi";
import { useRouter } from "next/router";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isClient = useIsClientSide();
  const { address } = useAccount();
  const { data: username } = useUsername(address);
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    const handleStart = (url: string) => url !== router.asPath && setNavigating(true);
    const handleComplete = (url: string) => url === router.asPath && setNavigating(false);

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router]);

  return (
    <Container p={10} maxW="1200">
      <Stack direction={["column", "row"]} spacing="5">
        <LinkBox>
          <NextLink href="/" passHref>
            <LinkOverlay flexDir="row" display="flex" alignItems="center">
              <Image src={logo} alt="Crypto Colosseum logo" />
              <Heading size="sm" ml="5">
                Delph's Table
              </Heading>
            </LinkOverlay>
          </NextLink>
        </LinkBox>
        <Spacer />
        {isClient && username && (
          <NextLink href="/" passHref>
            <Text>{username}</Text>
          </NextLink>
        )}
        <Box ml="5">
          <ConnectButton showBalance={false} chainStatus={"none"} />
        </Box>
      </Stack>

      <VStack mt="10" spacing={5}>
        {navigating && <Spinner />}
        {!navigating && children}
      </VStack>
      <Box as="footer" mt="200" textAlign="center">
        <Text fontSize="sm">
          <Link href="https://larvamaiorum.com/">
            A Crypto Colosseum: Larva Maiorum experience.
          </Link>
        </Text>
      </Box>
    </Container>
  );
};

export default Layout;
