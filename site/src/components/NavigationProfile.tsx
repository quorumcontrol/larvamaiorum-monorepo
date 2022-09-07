import {
  Box,
  Heading,
  HStack,
  LinkBox,
  LinkOverlay,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import NextLink from "next/link";
import { useUsername } from "../hooks/Player";
import useIsClientSide from "../hooks/useIsClientSide";
import { useWootgumpBalance } from "../hooks/useWootgump";
import humanFormatted from "../utils/humanFormatted";

const NavigationProfile: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { data: username } = useUsername(address);
  const isClient = useIsClientSide();
  const { data: balance } = useWootgumpBalance(address);

  if (!isClient || !username || !isConnected) {
    return (
      <ConnectButton
        showBalance={false}
        chainStatus={"none"}
        accountStatus="avatar"
      />
    );
  }

  return (
    <LinkBox>
      <HStack>
        <VStack alignItems="flex-end" spacing="0">
          <NextLink href={`/profile/${address}`} passHref>
            <LinkOverlay>
              <Heading size="md">{username}</Heading>
            </LinkOverlay>
          </NextLink>
          <Text fontSize="md">{humanFormatted(balance)} $GUMP</Text>
        </VStack>
        <Box>
          <ConnectButton
            showBalance={false}
            chainStatus={"none"}
            accountStatus="avatar"
          />
        </Box>
      </HStack>
    </LinkBox>
  );
};

export default NavigationProfile;