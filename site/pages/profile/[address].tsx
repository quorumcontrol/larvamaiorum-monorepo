import {
  Text,
  Spinner,
  VStack,
  Heading,
  Box,
  Flex,
  Button,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import Layout from "../../src/components/Layout";
import NFTCard from "../../src/components/NFTCard";
import { MetadataWithId, useUserBadges } from "../../src/hooks/BadgeOfAssembly";
import { useTeam, useUsername } from "../../src/hooks/Player";
import { emojiAvatarForAddress } from "../../src/utils/emojiAvatarForAddress";
import profileBackground from "../../assets/images/profileBackground.png";
import { useWootgumpBalance } from "../../src/hooks/useWootgump";
import border from "../../src/utils/dashedBorder";
import SignupModal from "../../src/components/SignupModal";

const Profile: NextPage = () => {
  const router = useRouter();
  const { address } = router.query;
  const { data: badges, isLoading } = useUserBadges(
    address as string | undefined
  );
  const { data: team, isLoading: isTeamLoading } = useTeam(address as string | undefined)
  const { data: username } = useUsername(address as string | undefined);
  const { data: gumpBalance } = useWootgumpBalance(
    address as string | undefined
  );

  console.log('profile page team: ', team)

  const [showModal, setShowModal] = useState(false)

  const avatar = useMemo(() => {
    if (!address) {
      return { color: "#000", emoji: "❓" };
    }
    return emojiAvatarForAddress(address as string);
  }, [address]);

  if (!address) {
    return (
      <>
        <Head>
          <title>Crypto Colosseum: Profile</title>
          <meta
            name="description"
            content={`Crypto Colosseum: Larva Maiorum profile page for ${username || address}`}
          />
        </Head>
        <Layout>
          <Spinner />
        </Layout>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Crypto Colosseum: Profile</title>
        <meta
          name="description"
          content={`Larva Maiorum profile page for ${username || address}`}
        />
      </Head>
      <SignupModal isOpen={showModal} onClose={() => setShowModal(false) } ignoreSkip />
      <Layout>
          <Box borderColor="brand.orange" borderWidth={["0", "1px"]}>
            <VStack spacing="0" backgroundImage={profileBackground.src}>
              <Flex
                borderRadius="90px"
                backgroundColor="#000"
                w="160px"
                h="160px"
                alignItems="center"
                justifyItems="center"
                textAlign="center"
                flexDir="row"
                justifyContent="space-around"
                mb="-25px"
                mt="25px"
              >
                <Flex
                  borderRadius="90px"
                  backgroundColor="brand.orange"
                  w="150px"
                  h="150px"
                  alignItems="center"
                  justifyItems="center"
                  textAlign="center"
                  flexDir="row"
                  justifyContent="space-around"
                >
                  <Flex
                    borderRadius="90px"
                    backgroundColor={avatar.color}
                    w="140px"
                    h="140px"
                    alignItems="center"
                    justifyItems="center"
                    textAlign="center"
                    flexDir="row"
                    justifyContent="space-around"
                  >
                    <Flex>
                      <Text textAlign="center" fontSize="100px">
                        {avatar.emoji}
                      </Text>
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
            </VStack>
            <Box position="relative" pb="40px" pt="30px">
              <VStack left="0" position={["relative", "absolute"]} py={["2", "40px"]} px={["0", "60px"]}>
                <Text fontSize="md">$WOOTGUMP</Text>
                <Text fontWeight="600">{gumpBalance?.toString()}</Text>
              </VStack>
              <VStack right="0" position={["relative", "absolute"]} py={["2", "40px"]} px={["0", "60px"]}>
                <Text fontSize="md">TEAM</Text>
                {team && (<Text fontWeight="600">{team.name}</Text>)}
                {!team && (
                  isTeamLoading ? <Spinner /> : <Text>?</Text>
                )}
              </VStack>
              <Box textAlign="center" mt={["4", "0"]}>
                <Heading size="lg" mb="0" pb="0">
                  {username}
                </Heading>
                <Text pt="0" fontSize={["11px", "sm"]}>
                  {address}
                </Text>
                <Button mt="2" variant="secondary" onClick={() => setShowModal(true)}>Edit</Button>
              </Box>
            </Box>
          </Box>
          <Box
            backgroundImage={["none", border]}
            p={[0, '10']}
            mt="10"
          >
            <Heading>BADGES</Heading>
            <Wrap spacing="10">
              {isLoading && <Spinner />}
              {badges?.map((metadata, i) => {
                return <WrapItem key={`nftcard-${i}`}><NFTCard metadata={metadata} /></WrapItem>;
              })}
            </Wrap>
            {/* <Stack direction={["column", "row"]} spacing="10" wrap="wrap">
              {isLoading && <Spinner />}
              {badges?.map((metadata, i) => {
                return <NFTCard metadata={metadata} key={`nftcard-${i}`} />;
              })}
            </Stack> */}
          </Box>
      </Layout>
    </>
  );
};

export default Profile;
