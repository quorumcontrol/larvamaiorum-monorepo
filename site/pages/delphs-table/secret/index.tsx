import { Box, Button, Heading, LinkBox, Text, VStack } from "@chakra-ui/react"
import { NextPage } from "next"
import Link from "next/link"
import { useMemo, useState } from "react"
import { useAccount } from "wagmi"
import AppLink from "../../../src/components/AppLink"
import LoggedInLayout from "../../../src/components/LoggedInLayout"
import ReadyPlayerMeCreator from "../../../src/components/ReadyPlayerMeCreator"
import { useUsername } from "../../../src/hooks/Player"

const SecretIndex: NextPage = () => {
  const { address } = useAccount()
  const [avatar, setAvatar] = useState("")
  const { data:username } = useUsername(address)

  const gameParam = useMemo(() => {
    return Buffer.from(JSON.stringify({id: address, name: username, avatar })).toString("base64")
  }, [address, username, avatar])

  const AIGameParam = useMemo(() => {
    return Buffer.from(JSON.stringify({useAI: true, id: address, name: username, avatar })).toString("base64")
  }, [address, username, avatar])

  return (
    <LoggedInLayout>
      {!avatar && (
        <ReadyPlayerMeCreator
          w="100%"
          minH={800}
          onPicked={(url) => setAvatar(url)}
        />
      )}
      {avatar && username && (
        <VStack spacing={10}>
          <Link href={`https://playcanv.as/p/SP3UNx7J/?arena=true&m=${gameParam}`} target="_blank">
              <Button variant={"primary"}>Launch Game (Humans Only)</Button>
          </Link>

          <Link href={`https://playcanv.as/p/SP3UNx7J/?arena=true&m=${AIGameParam}`} target="_blank">
              <Button variant={"primary"}>Play Against AI</Button>
          </Link>
          
        </VStack>
      )}
    </LoggedInLayout>
  )
}

export default SecretIndex
