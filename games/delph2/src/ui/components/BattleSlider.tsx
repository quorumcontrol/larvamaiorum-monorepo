import {
  Heading,
  HStack,
  Slider,
  SliderFilledTrack,
  SliderProps,
  SliderThumb,
  SliderTrack,
  Spacer,
  Text,
  VStack,
} from "@chakra-ui/react"
import { useState } from "react"

const BattleSlider: React.FC<SliderProps> = (userProps) => {
  return (
    <VStack>
      <Heading>Battle Strategy</Heading>
      <Slider
        colorScheme="red"
        aria-label="slider-battle-strategy"
        focusThumbOnChange={false}
        min={-100}
        max={100}
        {...userProps}
      >
        <SliderTrack h="20px" borderRadius="lg">
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb h="40px" w="40px" />
      </Slider>
      <HStack w="100% ">
        <Text>Defense</Text>
        <Spacer />
        <Text>Attack</Text>
      </HStack>
    </VStack>
  )
}

export default BattleSlider
