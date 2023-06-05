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
import Head from "next/head";

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
      <Head>
        <title>Empire Gambit: AI-Powered Roman Strategy Board Game | Ancient Gaming Redefined</title>

        <meta name="description" content="Play Empire Gambit, the ultimate AI gaming experience. This strategy board game, rooted in ancient Roman traditions, will challenge your strategic thinking and give you an unforgettable gaming experience." />
        <meta name="keywords" content="Casual Board Games, ai gaming, gaming, strategy, game, ancient game, roman, board game, AI in Gaming" />

        <meta name="robots" content="index, follow" />

        <link rel="canonical" href="https://empiregambit.com" />

        <meta property="og:title" content="Empire Gambit: AI-Powered Roman Strategy Board Game | Ancient Gaming Redefined" />
        <meta property="og:description" content="Play Empire Gambit, the ultimate AI gaming experience. This strategy board game, rooted in ancient Roman traditions, will challenge your strategic thinking and give you an unforgettable gaming experience." />
        <meta property="og:image" content="https://empiregambit.com/large_summary_image.png" />
        <meta property="og:url" content="https://empiregambit.com" />

        <meta name="twitter:title" content="Empire Gambit: AI-Powered Roman Strategy Board Game | Ancient Gaming Redefined" />
        <meta name="twitter:description" content="Play Empire Gambit, the ultimate AI gaming experience. This strategy board game, rooted in ancient Roman traditions, will challenge your strategic thinking and give you an unforgettable gaming experience." />
        <meta name="twitter:image" content="https://empiregambit.com/large_summary_image.png" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
    </Box>
  );
};

export default Layout;
