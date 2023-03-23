import Layout from "@/components/Layout"
import { Button, VStack } from "@chakra-ui/react"
import { NextPage } from "next"
import Link from "next/link"
import { useMemo } from "react"
import { useAccount } from "wagmi"
import { useUser } from "@/hooks/useUser"

const GamePage: NextPage = () => {
  const { address } = useAccount()
  const { data:user } = useUser()

  const { animationUrl:avatar, name:username } = user?.profile || {}
  
  const gameParam = useMemo(() => {
    return Buffer.from(JSON.stringify({id: address, name: username, avatar, numberOfHumans: 2 })).toString("base64")
  }, [address, username, avatar])

  const aiGameParam = useMemo(() => {
    return Buffer.from(JSON.stringify({numberOfHumans: 1, numberOfAi: 1, id: address, name: username, avatar })).toString("base64")
  }, [address, username, avatar])

  const tutorialParam = useMemo(() => {
    return Buffer.from(JSON.stringify({roomType: "TutorialRoom", numberOfHumans: 1, numberOfAi: 1, id: address, name: username, avatar })).toString("base64")
  }, [address, username, avatar])

  return (
    <Layout>
      {avatar && username && (
        <VStack spacing={10}>
          <Link href={`https://playcanv.as/p/SP3UNx7J/?arena=true&m=${gameParam}`} target="_blank">
              <Button variant={"secondary"}>Play against people</Button>
          </Link>

          <Link href={`https://playcanv.as/p/SP3UNx7J/?arena=true&m=${aiGameParam}`} target="_blank">
              <Button variant={"primary"}>Play Against AI</Button>
          </Link>

          <Link href={`https://playcanv.as/p/SP3UNx7J/?arena=true&m=${tutorialParam}`} target="_blank">
              <Button variant={"secondary"}>Practice Room</Button>
          </Link>
          
        </VStack>
      )}
    </Layout>
  )
}

export default GamePage
