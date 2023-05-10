import { Box, BoxProps, keyframes, Image } from "@chakra-ui/react"
import { useState } from "react";

type EtheralImageProps = BoxProps & {
  src?: string
}

const opacityTransitionTime = 3

const floatAnimation = keyframes`
  0%, 100% {
    transform: translateY(0) skew(0deg, 0deg);
  }
  25% {
    transform: translateY(-10px) skew(1deg, 0deg);
  }
  50% {
    transform: translateY(0) skew(0deg, 0deg);
  }
  75% {
    transform: translateY(-10px) skew(0deg, 1deg);
  }
`

const EtherealImage: React.FC<EtheralImageProps> = (props) => {
  const { src, ...boxProps } = props
  const [opacity, setOpacity] = useState(1);

  if (!src) {
    return <Box
      maxW="md"
      borderRadius="lg"
      boxShadow="xl"
      opacity={opacity}
      animation={`${floatAnimation} 7s ease-in-out infinite`}
      transition={`all ${opacityTransitionTime}s ease-in-out`}
      {...boxProps}
    >
      <Box w="512px" h="704px" />
    </Box>
  }

  return (
    <Box
      w="512px"
      h="704px"

      // boxShadow="xl"
      animation={`${floatAnimation} 7s ease-in-out infinite`}
      // boxShadow="0 0 20px 20px rgb(0,0,0,1) inset"
      {...boxProps}
    >
      <Image
        opacity={opacity}
        transition={`all ${opacityTransitionTime}s ease-in-out`}

        borderRadius="2xl"
        onLoad={() => {
          console.log('image load')
          setOpacity(0.9)
        }}
        src={src}
        alt="Card Placeholder"
        width="512px"
        height="704px"
        objectFit="contain"
        style={{
          maskImage: "radial-gradient(ellipse at center, rgba(0, 0, 0, 1) 50%, rgba(0, 0, 0, 0) 85%)",
          "WebkitMaskImage": "radial-gradient(ellipse at center, rgba(0, 0, 0, 1) 50%, rgba(0, 0, 0, 0) 85%)"
        }}
      />
    </Box>
  )

}

export default EtherealImage
