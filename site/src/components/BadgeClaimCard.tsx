import { Box, Button, Text, VStack } from "@chakra-ui/react";
import NextLink from 'next/link'
import Video from "./Video";

const BadgeClaimCard: React.FC<{
  animationUrl: string;
  name: string;
  url: string;
  description: string;
}> = ({ animationUrl, name, url, description }) => {
  return (
    <Box borderRadius="lg" borderWidth="1px" w="sm" pb="8">
      <Box h="70%" backgroundColor="#000">
        <Video animationUrl={animationUrl} loop muted />
      </Box>
      <VStack p="5" mb="5" spacing={6}>
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
        <NextLink href={url}>
          <Button>Claim</Button>
        </NextLink>
      </VStack>
    </Box>
  );
};

export default BadgeClaimCard