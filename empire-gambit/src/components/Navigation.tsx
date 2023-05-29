import {
  HStack,
  LinkBox,
  Spacer,
} from "@chakra-ui/react";
import NextLink from "next/link";
import Image from "next/image";
import "next/link"
import logo from "../assets/empireGambitLogo.png";
import NavigationProfile from "./NavigationProfile";

const Navigation = () => {
  return (
    <HStack spacing="5" px="5" w="100%">
      <LinkBox display="flex">
        <NextLink href="/">
          <Image src={logo} alt="Empire Gambit logo" width="200" priority />
        </NextLink>
      </LinkBox>

      <Spacer />

      <NavigationProfile />
    </HStack>
  );
};

export default Navigation;
