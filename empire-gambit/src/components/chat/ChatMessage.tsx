import { HStack, Text } from "@chakra-ui/react";

export interface Message {
  role: string
  content: string
}

const ChatMessage:React.FC<{message:Message}> = ({ message }) => {
  return (
    <HStack spacing={3}>
      <Text>{message.content}</Text>
    </HStack>
  );
};

export default ChatMessage
