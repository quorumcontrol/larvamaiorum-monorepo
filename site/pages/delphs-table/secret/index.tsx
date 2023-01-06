import { Box, Button, Heading, Text, VStack } from "@chakra-ui/react"
import { NextPage } from "next"
import { useMemo, useState } from "react"
import { useAccount } from "wagmi"
import AppLink from "../../../src/components/AppLink"
import LoggedInLayout from "../../../src/components/LoggedInLayout"
import ReadyPlayerMeCreator from "../../../src/components/ReadyPlayerMeCreator"
import { useUsername } from "../../../src/hooks/Player"
import { useDelphsLobby } from "../../../src/hooks/useDelphsLobby"

const SecretIndex: NextPage = () => {
  const { address } = useAccount()
  const [avatar, setAvatar] = useState("")
  const [waiting, setWaiting] = useState(false)
  const { data:username } = useUsername(address)
  const { requestTable, reservation } = useDelphsLobby()

  const handleGameClick = () => {
    setWaiting(true)
    requestTable({ name: username!, id: address!, avatar: avatar, size: 2})
  }

  const gameParam = useMemo(() => {
    if (!reservation) {
      return
    }
    console.log(JSON.parse(Buffer.from(reservation, 'base64').toString()))
    return reservation
  }, [reservation])

  return (
    <LoggedInLayout>
      {!avatar && (
        <ReadyPlayerMeCreator
          w="100%"
          minH={800}
          onPicked={(url) => setAvatar(url)}
        />
      )}
      {!reservation && avatar && !waiting && (
        <VStack>
          <Button onClick={handleGameClick}>Choose 2 Person room</Button>
        </VStack>
      )}
      {waiting && !reservation && (
        <Box>
          <Heading>Waiting for other players.</Heading>
        </Box>
      )}
      {avatar && reservation && (
        <AppLink href={`https://playcanv.as/p/3eqyo9QZ?arena=true&m=${gameParam}`} target="_blank">Launch Game</AppLink>
      )}
    </LoggedInLayout>
  )
}

export default SecretIndex
