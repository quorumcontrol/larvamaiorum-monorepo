import Layout from "@/components/Layout"
import { Box, Button, Heading, Spinner, Stack, VStack, keyframes } from "@chakra-ui/react"
import { NextPage } from "next"
import Link from "next/link"
import { useEffect, useMemo } from "react"
import { useUser } from "@/hooks/useUser"
import { useSafeFromUser } from "@/hooks/useSafe"
import { usePlayerDetails } from "@/hooks/usePlayerDetails"
import Router from "next/router"
import { Avatar } from '@readyplayerme/visage';
import useIsClientSide from "@/hooks/useIsClientSide"


const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  70% {
    transform: scale(1.2);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 0.7;
  }
`

const GamePage: NextPage = () => {
  const { data: user } = useUser()
  const { data: safeAddress } = useSafeFromUser()
  const { data: playerDetails } = usePlayerDetails(safeAddress)
  const isClient = useIsClientSide()

  const { animationUrl: avatar, name: username } = user?.profile || {}

  // const gameParam = useMemo(() => {
  //   return Buffer.from(JSON.stringify({ id: safeAddress, name: username, avatar, numberOfHumans: 2 })).toString("base64")
  // }, [safeAddress, username, avatar])

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
        <VStack>
          <Heading>Let&apos;s Gambit</Heading>
          <Stack direction={["column-reverse", "row"]}>
            <Box height="400px">
              <Avatar
                modelSrc={`${avatar}?quality=low`}
                animationSrc="/standingIdle.glb"
                halfBody={false}
                cameraTarget={1.65}
                cameraInitialDistance={2.5}
                />
            </Box>
            <VStack spacing={8} alignItems="left">
              {playerDetails && (
                <VStack alignItems="left">
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
                <Button variant="primary" animation={`${pulseAnimation} 2s infinite`} >Play</Button>
              </Link>

              <Link href={`https://playcanv.as/p/SP3UNx7J/?arena=true&m=${tutorialParam}`} target="_blank">
                <Button variant={"secondary"}>Practice Room</Button>
              </Link>

            </VStack>
          </Stack>
        </VStack>
      )}
    </Layout>
  )
}

export default GamePage
