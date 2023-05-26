"use client";

import React from "react";
import {
  Container,
  VStack,
  Spinner,
  Box,
} from "@chakra-ui/react";
import Navigation from "./Navigation";
import Footer from "./Footer";
import { useIsNavigating } from "@/hooks/useIsNavigating";
import landingPageBackground from "@/assets/landingPageBackground.png"

interface LayoutProps {
  showNavigation?: boolean;
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children, showNavigation=true }) => {
  const navigating = useIsNavigating()

  return (
    <Box>
      <Container padding="0" w={["600px", "1400px"]} maxW="1400px" zIndex={1}>

        {showNavigation && <Navigation />}

        <VStack mt={showNavigation ? 10 : 4} spacing={5} alignItems="left">
          {navigating && <Spinner />}
          {!navigating && children}
        </VStack>
        <Footer />
      </Container>
    </Box>
  );
};

export default Layout;
