"use client";

import React from "react"
import {
  Container,
  VStack,
  Spinner,
} from "@chakra-ui/react"
import Footer from "./Footer"
import { useIsNavigating } from "@/hooks/useIsNavigating"

const DistractionFreeLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigating = useIsNavigating()

  return (
    <>
      <Container p={10} maxW="1400" zIndex={1}>
        <VStack mt="10" spacing={5} alignItems="left">
          {navigating && <Spinner />}
          {!navigating && children}
        </VStack>
        <Footer />
      </Container>
    </>
  );
};

export default DistractionFreeLayout
