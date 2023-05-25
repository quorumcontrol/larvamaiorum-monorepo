import Layout from "@/components/Layout"
import { Box, Button, Center, HStack, Heading, Spinner, VStack } from "@chakra-ui/react"
import { NextPage } from "next"
import Link from "next/link"
import { useEffect, useMemo } from "react"
import { useUser } from "@/hooks/useUser"
import { useSafeFromUser } from "@/hooks/useSafe"
import { usePlayerDetails } from "@/hooks/usePlayerDetails"
import Router from "next/router"
import { Avatar } from '@readyplayerme/visage';
import useIsClientSide from "@/hooks/useIsClientSide"

const GamePage: NextPage = () => {
  const { data: user } = useUser()
  const { data: safeAddress } = useSafeFromUser()
  const { data: playerDetails } = usePlayerDetails(safeAddress)
  const isClient = useIsClientSide()

  const { animationUrl: avatar, name: username } = user?.profile || {}

  const gameParam = useMemo(() => {
    return Buffer.from(JSON.stringify({ id: safeAddress, name: username, avatar, numberOfHumans: 2 })).toString("base64")
  }, [safeAddress, username, avatar])

  const aiGameParam = useMemo(() => {
    return Buffer.from(JSON.stringify({ numberOfHumans: 1, numberOfAi: 1, id: safeAddress, name: username, avatar, level: playerDetails?.level })).toString("base64")
  }, [safeAddress, username, avatar, playerDetails?.level])

  const tutorialParam = useMemo(() => {
    return Buffer.from(JSON.stringify({ roomType: "TutorialRoom", numberOfHumans: 1, numberOfAi: 1, id: safeAddress, name: username, avatar })).toString("base64")
  }, [safeAddress, username, avatar])

  useEffect(() => {
    if (!user || user.profile) {
      return
    }
    Router.push("/profile/edit/start")
  }, [user])

  if (!isClient || !user) {
    return (
      <Layout>
        <VStack>
          <Heading>Loading...</Heading>
          <Spinner />
        </VStack>
      </Layout>
    )
  }

  return (
    <Layout>
      {avatar && username && (
        <Center>
          <HStack>
            <Box height="600px">
              <Avatar
                modelSrc={avatar}
                animationSrc="/standingIdle.glb"
                halfBody={false}
                cameraTarget={1.65}
                cameraInitialDistance={2.5}
                />
            </Box>
            <VStack spacing={4} alignItems="left">
              {playerDetails && (
                <VStack alignItems="left" spacing="4">
                  <Heading size="md">Level: {playerDetails.level}</Heading>
                  <Heading size="md">Wins until next level: {playerDetails.nextLevelIn}</Heading>
                  <Heading size="md">Record for today: {playerDetails.todaysWins} / {playerDetails.todaysGames}</Heading>
                  <Heading size="md">Attempts remaining today: {Math.max(playerDetails.maxPerDay - playerDetails.todaysGames, 0)}</Heading>
                </VStack>
              )}
              {/* <Link href={`https://playcanv.as/p/SP3UNx7J/?arena=true&m=${gameParam}`} target="_blank">
                <Button variant={"secondary"}>Play against people</Button>
              </Link> */}

              <Link href={`https://playcanv.as/p/SP3UNx7J/?arena=true&m=${aiGameParam}`} target="_blank">
                <Button variant={"primary"}>Play Against AI</Button>
              </Link>

              <Link href={`https://playcanv.as/p/SP3UNx7J/?arena=true&m=${tutorialParam}`} target="_blank">
                <Button variant={"secondary"}>Practice Room</Button>
              </Link>

            </VStack>
          </HStack>
        </Center>
      )}
    </Layout>
  )
}

export default GamePage
