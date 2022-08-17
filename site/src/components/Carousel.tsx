import {
  Box,
  Flex,
  FlexProps,
  Spacer,
  Text,
  TextProps,
  useBreakpoint,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useSwipeable } from "react-swipeable";

function sizeFromBreakpoint(breakpoint:string) {
  switch(breakpoint) {
    case 'base':
      return 100
    case 'sm':
      return 100
    case 'md':
      return 50
    default:
      return 33
  }
}

export const Slide: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {

  const breakpoint = useBreakpoint()

  return (
    <Flex w={`${sizeFromBreakpoint(breakpoint)}%`} shadow="md" flex="none">
      {children}
    </Flex>
  );
};

const Carousel: React.FC<FlexProps & { slideCount: number }> = (props) => {
  const { children, slideCount, ...flexOpts } = props;
  const breakpoint = useBreakpoint()
  const [currentSlide, setCurrentSlide] = useState(0);

  const prevSlide = () => {
    setCurrentSlide((s) => (s === 0 ? slideCount - 1 : s - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((s) => (s === slideCount - 1 ? 0 : s + 1));
  };

  const handlers = useSwipeable({
    onSwipedLeft: (_eventData) => nextSlide(),
    onSwipedRight: (_eventData) => prevSlide(),
  });

  const arrowStyles: TextProps = {
    cursor: "pointer",
    w: "auto",
    p: "16px",
    color: "white",
    fontWeight: "bold",
    fontSize: "18px",
    transition: "0.6s ease",
    borderRadius: "0 3px 3px 0",
    userSelect: "none",
    _hover: {
      opacity: 0.8,
      bg: "black",
    },
  };


  const carouselStyle = {
    transition: "all .5s",
    ml: `-${currentSlide * (sizeFromBreakpoint(breakpoint))}%`,
  };
  return (
    <Box>
      <Box>
        <Flex flexDirection="row">
          <Spacer />
          <Text {...arrowStyles} left="0" onClick={prevSlide}>
            &#10094;
          </Text>
          <Text {...arrowStyles} right="0" onClick={nextSlide}>
            &#10095;
          </Text>
        </Flex>
      </Box>
      <Flex w="full" alignItems="center" justifyContent="center" {...handlers}>
        <Flex w="full" overflow="hidden" pos="relative">
          <Flex w="full" {...flexOpts} {...carouselStyle}>
            {children}
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Carousel;
