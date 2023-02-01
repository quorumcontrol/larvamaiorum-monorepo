import React from "react"
import { VStack } from "@chakra-ui/react"
import NowPlaying from "./NowPlaying"
import PlayCard from "./PlayCard"
import { useCurrentQuest } from "./hooks/useQuest"
import QuestText from "./QuestText"

const RightSideUI: React.FC = () => {
  const quest = useCurrentQuest()

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
      <QuestText text={quest?.description}/>
      <PlayCard />
      <NowPlaying />
    </VStack>
  )
}

export default RightSideUI
