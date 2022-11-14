import { Badge, Box, Image, Text } from "@chakra-ui/react";
import { BigNumber } from "ethers";
import React from "react";
import ipfsToWeb from "../utils/ipfsToWeb";

export interface MaskMetadata {
  id: BigNumber
  name: string
  description: string
  image: string
  attributes: {
    trait_type: string
    value: string
  }[]
}

const MaskCard: React.FC<{ metadata: MaskMetadata }> = ({
  metadata: { name, description, image, attributes },
}) => {
  console.log('---------------------', attributes)
  const rarity = attributes.find((attr) => attr.trait_type === 'Rarity')!.value

  return (
    <Box
      borderWidth="1px"
      w="sm"
      h="xxl"
    >
      <Box h="70%" backgroundColor="#000">
          <Image
            src={ipfsToWeb(image)}
            alt={`image of ${name}`}
            style={{
              minWidth: "100%",
              maxWidth: "100%",
              maxHeight: "100%",
              minHeight: "100%",
              objectFit: "contain",
            }}
          />
      </Box>
      <Box p="5" mb="5">
        <Badge>{rarity}</Badge>
        <Text
          mt="4"
          fontWeight="semibold"
          as="h4"
          lineHeight="tight"
          noOfLines={1}
        >
          {name}
        </Text>
        <Text fontSize="sm">
          {description}
        </Text>
      </Box>
    </Box>
  );
};

export default MaskCard;
