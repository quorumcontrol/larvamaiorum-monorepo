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

const BattleSlider: React.FC<SliderProps> = (props) => {
  return (
    <VStack>
      <Heading>Battle Strategy</Heading>
      <Slider
        colorScheme="pink"
        aria-label="slider-ex-5"
        value={50}
        focusThumbOnChange={false}
        defaultValue={50}
        min={0}
        max={100}
        onChange={(v) => console.log("change")}
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
