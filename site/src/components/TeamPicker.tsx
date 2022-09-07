import {
  Box,
  Heading,
  HStack,
  Radio,
  RadioGroup,
  Spinner,
  Text,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { BigNumberish } from "ethers";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { MetadataWithId, useUserBadges } from "../hooks/BadgeOfAssembly";
import { useTeam } from "../hooks/Player";
import useIsClientSide from "../hooks/useIsClientSide";
import ipfsToWeb from "../utils/ipfsToWeb";
import AppLink from "./AppLink";

const size = "48px";

const PickCard: React.FC<{ metadata: MetadataWithId }> = ({ metadata }) => {
  return (
    <Radio value={metadata.id.toString()} colorScheme="red">
      <HStack spacing="3">
        <Box w={size} h={size} borderRadius="24px" overflow="hidden">
          <Image
            height={size}
            width={size}
            objectFit="contain"
            src={ipfsToWeb(metadata.image)}
            alt={`Image for ${metadata.name}`}
          />
        </Box>
        <Text fontSize="md">{metadata.name}</Text>
      </HStack>
    </Radio>
  );
};

const TeamPicker: React.FC<{
  address?: string;
  onSelect: (tokenId: BigNumberish) => any;
}> = ({ address, onSelect }) => {
  const { data: userBadges, isLoading } = useUserBadges(address);
  const { data: team, isLoading: isTeamLoading } = useTeam(address);
  const [selectedTeam, setSelectedTeam] = useState("0");

  const handleTeamClick = useCallback(
    (val: string) => {
      setSelectedTeam(val);
      onSelect(val);
    },
    [setSelectedTeam, onSelect]
  );

  useEffect(() => {
    if (isLoading || isTeamLoading || selectedTeam !== "0" || !userBadges || userBadges.length === 0) {
      return;
    }
    if (team) {
      return handleTeamClick(team.toString());
    }

    return handleTeamClick(userBadges[0].id.toString());
  }, [
    userBadges,
    onSelect,
    team,
    isLoading,
    isTeamLoading,
    handleTeamClick,
    selectedTeam,
  ]);

  const isClientSide = useIsClientSide();

  if (!isClientSide || isLoading || isTeamLoading) {
    return (
      <Box>
        <Spinner />
      </Box>
    );
  }

  if (userBadges?.length === 0) {
    return (
      <Box mt="10">
        <Text mb="5">Pick Team</Text>
        <Text>You have no <AppLink href="/badge-of-assembly">Badge of Assembly badges</AppLink>. Grab one to play.</Text>
      </Box>
    );
  }

  return (
    <Box mt="10">
      <Text mb="5">Pick Team</Text>
      <RadioGroup name="team" value={selectedTeam} onChange={handleTeamClick}>
        <Wrap spacing="32px">
          {(userBadges || []).map((badge) => {
            return (
              <WrapItem key={`team-picker-badge-${badge.id.toString()}`}>
                <PickCard metadata={badge} />
              </WrapItem>
            );
          })}
        </Wrap>
      </RadioGroup>
    </Box>
  );
};

export default TeamPicker;
