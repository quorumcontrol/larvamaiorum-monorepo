import { Box, Button, Text, VStack } from "@chakra-ui/react";
import NextLink from "next/link";
import Video from "./Video";

const BadgeClaimCard: React.FC<{
  animationUrl: string;
  name: string;
  url: string;
  description: string;
}> = ({ animationUrl, name, url, description }) => {
  return (
    <Box borderWidth="1px" w="sm" pb="8">
      <Box h="65%" backgroundColor="#000">
        <Video animationUrl={animationUrl} loop muted autoPlay />
      </Box>
      <VStack p={5} spacing={6} alignItems="left">
        <Text
          mt="4"
          fontWeight="semibold"
          as="h4"
          lineHeight="tight"
          noOfLines={1}
        >
          {name}
        </Text>
        <Text noOfLines={3} fontSize="md">
          {description}
        </Text>
        <Box>
          <NextLink href={url}>
            <Button variant="secondary">Claim</Button>
          </NextLink>
        </Box>
      </VStack>
    </Box>
  );
};

export default BadgeClaimCard;
