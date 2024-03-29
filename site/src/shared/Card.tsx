import {
  Box,
  Image,
  Heading,
  AspectRatio,
  BoxProps,
  Tag,
  TagLeftIcon,
  TagLabel,
  Text,
} from "@chakra-ui/react"
import { TbWallet } from "react-icons/tb"

export interface CardProps {
  identifier: string
  name: string
  description: string
  art: string
  frameColor: string
  costToPlay?: number
}

export const Card: React.FC<
  BoxProps & { card: CardProps; showCost?: boolean; showDescription?: boolean }
> = (props) => {
  const { card, showCost, showDescription, ...boxProps } = props
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

      {showDescription && (
        <Box
          position="absolute"
          top={["0px", "0px", "0px", "20px"]}
          left="0"
          width="100%"
          px={[0, 0, 0, 4]}
        >
          <Box
            bgColor={frameColor}
            borderRadius="10px"
            textAlign="center"
            p="4"
          >
            <Text fontSize="sm">{card.description}</Text>
          </Box>
        </Box>
      )}

      <Box
        position="absolute"
        bottom={["0px", "0px", "0px", "20px"]}
        left="0"
        width="100%"
        px={[0, 0, 0, 4]}
      >
        <Box bgColor={frameColor} borderRadius="10px" textAlign="center" py="3">
          <Heading size="md">{card.name}</Heading>
        </Box>
      </Box>
      
      {showCost && (
        <Tag
          variant={"solid"}
          bgColor={"gray.900"}
          size="lg"
          position="absolute"
          top="-10px"
          right="-10px"
        >
          <TagLeftIcon boxSize="12px" as={TbWallet} />
          <TagLabel> {card.costToPlay}</TagLabel>
        </Tag>
      )}
    </Box>
  )
}
