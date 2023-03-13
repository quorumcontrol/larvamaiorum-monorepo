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
import "next/link"
import { Link } from "@chakra-ui/next-js";
import logo from "../assets/empireGambitLogo.png";
import { useRouter } from "next/router";
import { useEffect } from "react";
// import NavigationProfile from "./NavigationProfile";

const NavItem: React.FC<{ href: string; children: React.ReactNode, isMobile?: boolean }> = ({
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
      <Link href={href} display="flex" fontSize="md">
        {children}
      </Link>
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
              <Image src={logo} alt="Empire Gambit Logo" width="200" />
            </NextLink>
          </LinkBox>
        </DrawerHeader>
        <VStack alignItems="left" ml="5" mt="5" spacing="5">
          <NavItem isMobile href="/">Home</NavItem>
          <NavItem isMobile href="/about">About</NavItem>
          <NavItem isMobile href="/sneapeak">Sneak Peak</NavItem>
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
          <NextLink href="/">
            <Image src={logo} alt="Crypto Colosseum logo" width="200" priority />
          </NextLink>
        </LinkBox>

        <NavItem href="/">Home</NavItem>
        <NavItem href="/about">About</NavItem>
        <NavItem href="/sneapeak">Sneak Peak</NavItem>

        {/* <Spacer /> */}

        {/* <NavigationProfile /> */}
      </HStack>
    </>
  );
};

export default Navigation;
