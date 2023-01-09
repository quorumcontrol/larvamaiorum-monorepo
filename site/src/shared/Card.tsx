import { Box, Image, Heading, AspectRatio, BoxProps } from "@chakra-ui/react"

export interface CardProps {
  name: string
  art: string
  frameColor: string
}

export const Card: React.FC<BoxProps & { card: CardProps }> = (props) => {
  const { card, ...boxProps } = props
  const frameColor = card.frameColor

  return (
    <Box
      {...boxProps}
      position="relative"
      bgColor={frameColor}
      p="8px"
      borderRadius="15px"
    >
      <AspectRatio width="100%" ratio={2 / 3}>
        <Image
          src={card.art}
          alt={`The image of ${card.name}`}
          border="1px"
          borderRadius="10px"
          borderColor="brand.cardBorder"
          objectFit="cover"
        />
      </AspectRatio>

      <Box position="absolute" bottom="20px" left="0" width="100%" px="4">
        <Box bgColor={frameColor} borderRadius="10px" textAlign="center" py="3">
          <Heading size="md">{card.name}</Heading>
        </Box>
      </Box>
    </Box>
  )
}
