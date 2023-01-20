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
  const {onChange:userOnChange, ...props} = userProps
  const [sliderValue, setSliderValue] = useState(props.defaultValue)

  const onChange = (val:number) => {
    setSliderValue(val)
    if (userOnChange) {
      userOnChange(val)
    }
  }

  return (
    <VStack>
      <Heading>Battle Strategy</Heading>
      <Slider
        colorScheme="brand.orange"
        aria-label="slider-battle-strategy"
        value={sliderValue}
        focusThumbOnChange={false}
        defaultValue={props.defaultValue || 0}
        min={-100}
        max={100}
        onChange={onChange}
        {...props}
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
