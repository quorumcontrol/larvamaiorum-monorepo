import React from "react"
import { Box, Heading, HStack, Progress, Spacer, Text, VStack } from "@chakra-ui/react"
import { usePlayerStats } from "./hooks/useCurrentPlayer"
import { usePlayCanvasContext } from "./appProvider"

const TopLeftUI: React.FC = () => {
  const { player, max } = usePlayerStats()

  if (!player || !max) {
    return null
  }

  return (
    <Box
      p="4"
      alignItems="left"
      position="fixed"
      top="10px"
      left="10px"
      width="200px"
      // maxWidth={["10vw", "10vw", "10vw", "20vw"]}
      // minWidth="300px"
      borderRadius={"lg"} bgColor="rgba(0,0,0,0.6)"
    >
      <Heading fontSize="lg" lineHeight="sm" mb={[2,2,2,6]}>{player.name}</Heading>
      <VStack alignItems={"left"} fontSize="sm" spacing={[1,1,1,4]}>
        <VStack alignItems={"left"} textColor="yellow.200">
          <HStack mb="-10px">
            <Text>Attack</Text>
            <Spacer />
            <Text>{Math.floor(player.currentAttack ||  0)}</Text>
          </HStack>
          <Progress height="6px" value={player.currentAttack} max={max.maxAttack} colorScheme="yellow"/>
        </VStack>
        <VStack alignItems={"left"} textColor="red.200">
          <HStack mb="-10px">
            <Text>Defense</Text>
            <Spacer />
            <Text>{Math.floor(player.currentDefense || 0)}</Text>
          </HStack>
          <Progress height="6px" value={player.currentDefense} max={max.maxDefense} colorScheme="red"/>
        </VStack>
        <VStack alignItems={"left"} textColor="blue.200">
          <HStack mb="-10px">
            <Text >Health</Text>
            <Spacer />
            <Text>{Math.floor(player.currentHealth || 0)}</Text>
          </HStack>
          <Progress height="6px" value={player.currentHealth} max={max.maxHealth} colorScheme="blue"/>
        </VStack>
      </VStack>
      <Text mt={[2,2,2,6]} fontSize="sm">Gump: {player.wootgumpBalance}</Text>
    </Box>
  )
}

export default TopLeftUI
