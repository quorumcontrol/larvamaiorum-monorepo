import Layout from "@/components/Layout";
import { Heading, VStack } from "@chakra-ui/react";
import { NextPage } from "next";


const SuccessPage:NextPage = () => {
  return (
    <Layout>
      <VStack>
        <Heading>Thanks!</Heading>
      </VStack>
    </Layout>
  )
}

export default SuccessPage
