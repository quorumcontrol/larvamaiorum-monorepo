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

  const AIGameParam = useMemo(() => {
    return Buffer.from(JSON.stringify({numberOfHumans: 1, numberOfAi: 1, id: address, name: username, avatar })).toString("base64")
  }, [address, username, avatar])

  return (
    <Layout>
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
    </Layout>
  )
}

export default GamePage
