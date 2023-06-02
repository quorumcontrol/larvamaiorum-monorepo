import { Link } from "@chakra-ui/next-js"
import { HStack, Text, VStack } from "@chakra-ui/react"
import { SocialIcon } from "react-social-icons"

const Footer: React.FC = () => {
  return (
    <VStack as="footer" mt="200" pt="10" textAlign="center" alignItems="center" bgColor={["black", "transparent"]} spacing="6">
      <HStack>
        <SocialIcon url="https://twitter.com/larva_maiorum" />
        <SocialIcon url="https://discord.gg/tTSNvAuK" />
        <SocialIcon url="https://t.me/crypto_colosseum" />
      </HStack>
      <Text fontSize="sm">
        A Crypto Colosseum: Larva Maiorum experience.
      </Text>
      <HStack spacing="8">
        <Link href="/privacy"><Text fontSize="sm">Privacy Policy</Text></Link>
        <Link href="/tos"><Text fontSize="sm">Terms of Service</Text></Link>
      </HStack>
      <Text fontSize="12px">
        &copy; 2023 Quorum Control GmbH
      </Text>
    </VStack>
  )
}

export default Footer