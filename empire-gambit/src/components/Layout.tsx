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
    <Box backgroundImage={landingPageBackground.src} backgroundRepeat="no-repeat" backgroundPosition="top center">
      <Container padding="0" maxW="1400" zIndex={1}>

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
