import { Button, Text, VStack } from "@chakra-ui/react"
import { NextPage } from "next"
import { useMemo, useState } from "react"
import { useAccount } from "wagmi"
import LoggedInLayout from "../../../src/components/LoggedInLayout"
import ReadyPlayerMeCreator from "../../../src/components/ReadyPlayerMeCreator"
import { useUsername } from "../../../src/hooks/Player"
import { useDelphsLobby } from "../../../src/hooks/useDelphsLobby"

const SecretIndex: NextPage = () => {
  const { address } = useAccount()
  const [avatar, setAvatar] = useState("")
  const { data:username } = useUsername(address)
  const { rooms, requestTable, reservation } = useDelphsLobby()

  const gameParam = useMemo(() => {
    if (!reservation) {
      return
    }
    console.log(JSON.parse(Buffer.from(reservation, 'base64').toString()))
    return reservation
  }, [reservation])

  console.log("rooms", rooms)
  return (
    <LoggedInLayout>
      {!avatar && (
        <ReadyPlayerMeCreator
          w="100%"
          minH={800}
          onPicked={(url) => setAvatar(url)}
        />
      )}
      {!reservation && avatar && (
        <VStack>
          <Button onClick={() => requestTable({ name: username!, id: address!, avatar: avatar, size: 2})}>Choose 2 Person room</Button>
          <Button onClick={() => requestTable({ name: username!, id: address!, avatar: avatar, size: 4})}>Choose 4 Person room</Button>
        </VStack>
      )}
      {avatar && reservation && (
        <Text>we play a game ?om={gameParam}</Text>
      )}
    </LoggedInLayout>
  )
}

export default SecretIndex
