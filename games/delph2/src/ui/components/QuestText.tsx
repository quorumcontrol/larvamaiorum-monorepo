import { Heading, Text, VStack } from '@chakra-ui/react'
import React from 'react'

const QuestText:React.FC<{text?:string}> = ( { text }) => {
  if (!text) {
    return null
  }
  return (
    <VStack p={[2, 2, 2, 4]} m={4} borderRadius={"lg"} bgColor="rgba(0,0,0,0.6)" alignItems="left" width="100%">
      <Heading size="md">Quest</Heading>
      <Text>{text}</Text>
    </VStack>
  )
}

export default QuestText
