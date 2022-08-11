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
  HStack,
  Flex,
} from "@chakra-ui/react";
import Image from "next/image";
import NextLink from "next/link";
import logo from "../../assets/images/logo.svg";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import useIsClientSide from "../hooks/useIsClientSide";
import { useUsername } from "../hooks/Player";
import { useAccount } from "wagmi";
import { useRouter } from "next/router";
import AppLink from "./AppLink";

const NavItem: React.FC<{ href: string; children: React.ReactNode }> = ({
  href,
  children,
}) => {
  return (
    <Flex alignItems={"center"} justifyContent={"space-between"}>
      <AppLink href={href} display="flex" fontSize="md">
        {children}
      </AppLink>
    </Flex>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isClient = useIsClientSide();
  const { address } = useAccount();
  const { data: username } = useUsername(address);
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);

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

  return (
    <Container p={10} maxW="1200">
      <Stack direction={["column", "row"]} spacing="5">
        <LinkBox display="flex">
          <NextLink href="/" passHref>
            <LinkOverlay flexDir="row" display="flex" alignItems="center">
              <Image src={logo} alt="Crypto Colosseum logo" />
            </LinkOverlay>
          </NextLink>
        </LinkBox>

        <NavItem href="/delphs-table">Delph&apos;s Table</NavItem>
        <NavItem href="/badge-of-assembly">Badge of Assembly</NavItem>
        <NavItem href="https://docs.larvamaiorum.com/">Litepaper</NavItem>
        <NavItem href="/classic">Classic</NavItem>
        
        <Spacer />

        <VStack ml="5">
          <ConnectButton showBalance={false} chainStatus={"none"} />
          {isClient && username && (
            <NextLink href="/" passHref>
              <Text>{username}</Text>
            </NextLink>
          )}
        </VStack>
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
        <Text pt="4" fontSize="12px">
          &copy; 2022 Quorum Control GmbH
        </Text>
      </Box>
    </Container>
  );
};

export default Layout;
