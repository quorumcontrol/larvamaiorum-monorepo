import { Box, Text, VStack } from "@chakra-ui/react";
import Image from "next/image";
import { useAccoladesBalance } from "../hooks/useAccolades";
import { ACCOLADES_WITH_IMAGES } from "../utils/accoladesWithImages";

const AccoladeCard: React.FC<{ tokenId: number, address?:string, hideCount?:boolean }> = ({ tokenId, address, hideCount }) => {
  const { data } = useAccoladesBalance(tokenId, address)
  const token = ACCOLADES_WITH_IMAGES[tokenId]

  return (
    <Box borderRadius="lg" p="5" bgColor="brand.accoladeBackground">
      <VStack>
        <Box>
          <Image src={token.image} alt={token.name} />
        </Box>
        <Text
          mt="4"
          fontWeight="semibold"
          as="h4"
          lineHeight="tight"
          noOfLines={1}
        >
          {token.name}
        </Text>
        {!hideCount && <Text fontSize="md">Count: {data?.toString()}</Text>}
      </VStack>
    </Box>
  );
};

export default AccoladeCard
