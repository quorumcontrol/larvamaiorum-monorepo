import React from "react"
import { VStack } from "@chakra-ui/react"
import NowPlaying from "./NowPlaying"

const RightSideUI: React.FC = () => {
  return (
    <VStack
      alignItems="left"
      paddingRight="10px"
      position="fixed"
      bottom="20px"
      right={0}
      maxWidth="20vw"
      minWidth="300px"
    >
      <NowPlaying />
    </VStack>
  )
}

export default RightSideUI
