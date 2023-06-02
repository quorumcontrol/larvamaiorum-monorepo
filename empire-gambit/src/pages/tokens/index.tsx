import Layout from "@/components/Layout";
import { isLocalhost } from "@/utils/isLocalhost";
import { Heading, VStack, Text, Button } from "@chakra-ui/react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { NextPage } from "next";
import Router from "next/router";


const TokenPage:NextPage = () => {
  const client = useSupabaseClient()

  const onBuyTokenClick = async () => {
    const { data, error } = await client.functions.invoke("create-stripe-session", {
      body: {
        successUrl: `${window.location.origin}/tokens/success`,
        cancelUrl: `${window.location.origin}/tokens/success?canceled=true`,
        testOnly: isLocalhost(),
      }
    })
    if (error) {
      console.error("error doing stripe: ", error)
    }
    console.log("data", data)
    const { url } = data
    Router.push(url)
  }

  return (
    <Layout>
      <VStack>
        <Heading>Buy Tokens</Heading>
        <Text>Tokens are $0.25 each. Click the button to buy.</Text>
        <Button onClick={onBuyTokenClick} variant="primary">Buy Tokens</Button>
      </VStack>
    </Layout>
  )
}

export default TokenPage
