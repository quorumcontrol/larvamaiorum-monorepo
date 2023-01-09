import { Box, Image, Heading } from "@chakra-ui/react"

export interface CardProps {
  name:string
  art:string
  frameColor:string
}

export const Card:React.FC<{card:CardProps}> = ({ card }) => {
  const frameColor = card.frameColor
  
  return (
    <Box bgColor={frameColor} p="8px" borderRadius="15px">
    <Box position="relative" >
      <Image src={card.art} height="300px" width="200px" alt={`The image of ${card.name}`} border="1px" borderRadius="10px" borderColor="brand.cardBorder" />
      <Box position="absolute" bottom="30px" left="15px" width="170px" px="4" py="0" bgColor={frameColor} borderRadius="10px" textAlign="center">
        <Heading size="lg">{card.name}</Heading>
      </Box>
    </Box>
    </Box>
  )
}
