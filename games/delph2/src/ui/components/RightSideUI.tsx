import React from "react"
import { VStack } from "@chakra-ui/react"
import NowPlaying from "./NowPlaying"
import PlayCard from "./PlayCard"

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
      <PlayCard />
      <NowPlaying />
    </VStack>
  )
}

export default RightSideUI