import { Box, Button, FormControl, HStack, Input, Link, Spinner, VStack } from "@chakra-ui/react"
import RecordButton from "./RecordButton"
import { FormEventHandler, useState } from "react"

interface TextInputHandleProps {
  onTextSubmit?: (text: string) => any
}

type UserConversationProps = React.ComponentProps<typeof RecordButton> & TextInputHandleProps

const UserConversation: React.FC<UserConversationProps> = ({ onRecord, loading, onTextSubmit }) => {
  const [usingText, setUsingText] = useState(false)
  const [userText, setUserText] = useState("")

  const onSubmit:FormEventHandler = (evt) => {
    evt.preventDefault()
    setUserText("")
    onTextSubmit?.(userText)
  }

  if (loading) {
    return (
      <VStack>
         <Spinner />
      </VStack>
    )
  }

  if (usingText) {
    return (
      <VStack spacing="8">
        <HStack as="form" onSubmit={onSubmit}>
          <FormControl>
            <Input type="text" value={userText} onChange={(evt) => setUserText(evt.target.value)} w={["15em", "25em"]} />
          </FormControl>
          <Button type="submit" variant="primary">Send</Button>
        </HStack>
        <Link onClick={() => setUsingText(false)} fontSize="md" textDecoration="underline">Talk instead of typing</Link>
      </VStack>
    )
  }

  return (
    <VStack spacing="8">
      <RecordButton onRecord={onRecord} loading={loading} />
      <Link onClick={() => setUsingText(true)} fontSize="md" textDecoration="underline">Type instead of talk</Link>
    </VStack>
  )
}

export default UserConversation
