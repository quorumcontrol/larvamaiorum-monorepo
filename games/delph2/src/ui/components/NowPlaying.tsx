import { Box, Heading, HStack, Image, Text, VStack } from '@chakra-ui/react'
import React, { useContext, useEffect, useState } from 'react'
import { PlayCanvasApplication } from './appProvider'
import useMusic from './hooks/useMusic'

const NowPlaying:React.FC = () => {
  const nowPlaying = useMusic()
  const [audio, setAudio] = useState<HTMLAudioElement>()

  useEffect(() => {
    if (audio) {
      audio.pause()
      audio.remove()
    }
    const nextAudio = new Audio(nowPlaying.url)
    nextAudio.volume = 0.05

    nextAudio.play()
    setAudio(nextAudio)
  }, [nowPlaying])

  return (
    <Box p={4} m={4} borderRadius={"lg"} bgColor="#000" opacity={0.6}>
      <VStack alignItems="left">
      <Heading size="sm">
        Now Playing
      </Heading>
      <HStack alignItems={"top"}>
        <Image src={nowPlaying.artwork} h="64px" w="64px" />
        <VStack alignItems="left">
          <Text fontSize='sm'>
            {nowPlaying.name}
          </Text>
          <Text fontSize="xs">
            by {nowPlaying.artist}
          </Text>
        </VStack>
      </HStack>
      </VStack>

    </Box>
  )
}

export default NowPlaying