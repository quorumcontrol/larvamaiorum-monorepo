import { Box, Spinner, Text, VStack } from "@chakra-ui/react";
import { BigNumber } from "ethers";
import Image from "next/image";
import { useBadgeMetadata } from "../hooks/BadgeOfAssembly";
import ipfsToWeb from "../utils/ipfsToWeb";
import NFTCard from "./NFTCard";

type Variants = "default" | "small";

const BadgeCard: React.FC<{ tokenId?: string; variant: Variants }> = ({
  tokenId,
  variant = "default",
}) => {
  const { data: metadata } = useBadgeMetadata(tokenId);

  if (variant === "small") {
    if (!metadata) {
      return (
        <Box h="200px" w="200px">
          <Spinner />
        </Box>
      );
    }

    return (
      <VStack>
        <Image
          src={ipfsToWeb(metadata.image)}
          height="200px"
          width="200px"
          objectFit="contain"
          alt={`Image for ${metadata.name}`}
        />
        <Text>{metadata.name}</Text>
      </VStack>
    );
  }

  if (!metadata) {
    return (
      <Box borderRadius="lg" borderWidth="1px" w="sm" h="md" overflow="hidden">
        <Spinner />
      </Box>
    );
  }

  return <NFTCard metadata={{ ...metadata, id: BigNumber.from(tokenId) }} />;
};

export default BadgeCard;
