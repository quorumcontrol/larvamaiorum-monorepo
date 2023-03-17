import { HStack, Text, VStack } from "@chakra-ui/react"
import { SocialIcon } from "react-social-icons"

const Footer: React.FC = () => {
  return (
    <VStack as="footer" mt="200" pt="10" textAlign="center" alignItems="center" bgColor={["black", "transparent"]}>
      <HStack>
        <SocialIcon url="https://twitter.com/larva_maiorum" />
        <SocialIcon url="https://discord.gg/tTSNvAuK" />
        <SocialIcon url="https://t.me/crypto_colosseum" />
      </HStack>
      <Text fontSize="sm">
        A Crypto Colosseum: Larva Maiorum experience.
      </Text>
      <Text pt="4" fontSize="12px">
        &copy; 2023 Quorum Control GmbH
      </Text>
    </VStack>
  )
}

export default Footer