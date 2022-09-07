import { Box, Spinner, Text, VStack, Wrap, WrapItem } from "@chakra-ui/react";
import Image from "next/image";
import { TOKENS } from "../utils/accolades";
import { useAccoladesBalance, usePlayerAccolades } from "../hooks/useAccolades";
import gold from "../../assets/images/accolades/gold.png";
import silver from "../../assets/images/accolades/silver.png";
import bronze from "../../assets/images/accolades/bronze.png";
import firstgump from "../../assets/images/accolades/firstgump.png";
import firstblood from "../../assets/images/accolades/firstblood.png";
import battleWon from "../../assets/images/accolades/battlewon.png"


function imageFromToken(id: number) {
  return [gold, silver, bronze, firstgump, firstblood, battleWon][id];
}

const AccoladeCard: React.FC<{ tokenId: number, address?:string }> = ({ tokenId, address }) => {
  const { data } = useAccoladesBalance(tokenId, address)

  return (
    <Box borderRadius="lg" p="5" bgColor="brand.accoladeBackground">
      <VStack>
        <Box>
          <Image src={imageFromToken(tokenId)} alt={TOKENS[tokenId].name} />
        </Box>
        <Text
          mt="4"
          fontWeight="semibold"
          as="h4"
          lineHeight="tight"
          noOfLines={1}
        >
          {TOKENS[tokenId].name}
        </Text>
        <Text fontSize="md">Count: {data?.toString()}</Text>
      </VStack>
    </Box>
  );
};

const AccoladesDisplay: React.FC<{ address?: string }> = ({ address }) => {
  const { data: playerAccolades, isLoading } = usePlayerAccolades(address);

  return (
    <Wrap spacing="10">
      {isLoading && <Spinner />}
      {playerAccolades?.map((id, i) => {
        return (
          <WrapItem key={`nftcard-${id}`}>
            <AccoladeCard tokenId={id.toNumber()} address={address} />
          </WrapItem>
        );
      })}
    </Wrap>
  );
};

export default AccoladesDisplay;
