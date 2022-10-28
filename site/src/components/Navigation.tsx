import {
  Box,
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  IconButton,
  LinkBox,
  LinkOverlay,
  Spacer,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { HamburgerIcon } from "@chakra-ui/icons";
import Image from "next/image";
import AppLink from "./AppLink";
import logo from "../../assets/images/logo.svg";
import { useRouter } from "next/router";
import { useEffect } from "react";
import NavigationProfile from "./NavigationProfile";

const NavItem: React.FC<{ href: string; children: React.ReactNode, isMobile?:boolean }> = ({
  href,
  children,
  isMobile
}) => {
  return (
    <Flex
      alignItems={"center"}
      justifyContent={"space-between"}
      display={isMobile ? 'flex' : ["none", "flex"]}
    >
      <AppLink href={href} display="flex" fontSize="md">
        {children}
      </AppLink>
    </Flex>
  );
};

const Navigation = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();

  useEffect(() => {
    router.events.on("routeChangeStart", onClose);

    return () => {
      router.events.off("routeChangeStart", onClose);
    };
  }, [router, onClose]);

  const MobileNavContent = (
    <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent bg="brand.background">
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">
          <LinkBox>
            <NextLink href="/" passHref>
              <LinkOverlay flexDir="row" display="flex" alignItems="center">
                <Image src={logo} alt="Crypto Colosseum logo" />
              </LinkOverlay>
            </NextLink>
          </LinkBox>
        </DrawerHeader>
        <VStack alignItems="left" ml="5" mt="5" spacing="5">
          <NavItem isMobile href="/">Home</NavItem>
          <NavItem isMobile href="/delphs-table">Delph&apos;s Table</NavItem>
          <NavItem isMobile href="/leaderboard">Leaderboard</NavItem>
          <NavItem isMobile href="/badge-of-assembly">Badge of Assembly</NavItem>
          <NavItem isMobile href="/masks">Masks</NavItem>
          <NavItem isMobile href="/classic">Classic</NavItem>
          <NavItem isMobile href="https://docs.larvamaiorum.com/">Litepaper</NavItem>
        </VStack>
      </DrawerContent>
    </Drawer>
  );
  return (
    <>
      {MobileNavContent}
      <HStack spacing="5">
        <Box display={["flex", "none"]}>
          <IconButton
            icon={<HamburgerIcon />}
            aria-label="open mobile nav"
            onClick={onOpen}
          />
        </Box>
        <LinkBox display={["none", "flex"]}>
          <NextLink href="/" passHref>
            <LinkOverlay flexDir="row" display="flex" alignItems="center">
              <Image src={logo} alt="Crypto Colosseum logo" />
            </LinkOverlay>
          </NextLink>
        </LinkBox>

        <NavItem href="/delphs-table">Delph&apos;s Table</NavItem>
        <NavItem href="/leaderboard">Leaderboard</NavItem>
        <NavItem href="/badge-of-assembly">Badge of Assembly</NavItem>
        <NavItem href="/masks">Masks</NavItem>
        <NavItem href="/classic">Classic</NavItem>
        <NavItem href="https://docs.larvamaiorum.com/">Litepaper</NavItem>

        <Spacer />

        <NavigationProfile />
      </HStack>
    </>
  );
};

export default Navigation;
