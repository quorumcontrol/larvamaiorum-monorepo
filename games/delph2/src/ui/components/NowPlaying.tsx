import {
  Box,
  Heading,
  HStack,
  Image,
  Text,
  VStack,
  Icon,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from "@chakra-ui/react"
import React, { useEffect, useState } from "react"
import useMusic from "./hooks/useMusic"
import { TbVolume } from "react-icons/tb"

const NowPlaying: React.FC = () => {
  const nowPlaying = useMusic()
  const [audio, setAudio] = useState<HTMLAudioElement>()
  const [sliderValue, setSliderValue] = useState(50)

  const url = nowPlaying.url

  useEffect(() => {
    if (!url) {
      return
    }
    if (audio && audio.currentSrc.toLowerCase() == url?.toLowerCase()) {
      return
    }
    if (audio) {
      audio.pause()
      audio.remove()
    }

    const nextAudio = new Audio(url)
    nextAudio.volume = 0.05 * (sliderValue / 50)

    nextAudio.play()
    setAudio(nextAudio)
  }, [url])

  useEffect(() => {
    if (!audio) {
      return
    }
    audio.volume = 0.05 * (sliderValue / 50)
  }, [sliderValue, audio])

  return (
    <Box p={[2, 2, 2, 4]} m={4} borderRadius={"lg"} bgColor="rgba(0,0,0,0.6)">
      <VStack alignItems="left">
        <Heading size="sm" display={["none", "none", "none", "block"]}>
          Now Playing
        </Heading>
        <HStack alignItems={"top"}>
          <Image
            src={nowPlaying.artwork}
            h="64px"
            w="64px"
            display={["none", "none", "none", "block"]}
          />
          <Text fontSize="sm" maxWidth="200px">
            {nowPlaying.name} by {nowPlaying.artist}
          </Text>
        </HStack>
        <HStack>
          <Icon as={TbVolume} boxSize="4" />

          <Slider
            aria-label="slider-ex-5"
            value={sliderValue}
            focusThumbOnChange={false}
            defaultValue={50}
            min={0}
            max={125}
            onChange={(v) => setSliderValue(v)}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
        </HStack>
      </VStack>
    </Box>
  )
}

export default NowPlaying
