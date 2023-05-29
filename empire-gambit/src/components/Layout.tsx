"use client";

import React from "react";
import {
  Container,
  VStack,
  Spinner,
  Box,
  Center,
} from "@chakra-ui/react";
import Navigation from "./Navigation";
import Footer from "./Footer";
import { useIsNavigating } from "@/hooks/useIsNavigating";

interface LayoutProps {
  showNavigation?: boolean;
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children, showNavigation = true }) => {
  const navigating = useIsNavigating()

  return (
    <Box zIndex={1}>

      {showNavigation && <Navigation />}

      <>
        {navigating && <Spinner />}
        {!navigating && children}
      </>
      <Footer />
    </Box>
  );
};

export default Layout;
