import React from 'react';
import { Box, Flex, Text, Avatar } from '@chakra-ui/react';
import { AiOutlineUser } from 'react-icons/ai';
import Linkify from "react-linkify";
import { Link } from '@chakra-ui/next-js';

export interface ChatMessageProps {
  name: string
  content: string
  isOwnMessage: boolean
  timestamp: string
  role?: string
}

const ChatMessage:React.FC<ChatMessageProps> = ({ name, content: message, isOwnMessage, timestamp }) => {

  const createLink = (decoratedHref: string, decoratedText: string, key: number) => {
    return <Link href={decoratedHref} key={key} textColor="blue" target="_blank">{decoratedText}</Link>
  }

  return (
    <Flex
      flexDirection={isOwnMessage ? 'row-reverse' : 'row'}
      alignItems="flex-start"
      mt="4"
    >
      <Avatar
        size="sm"
        name={name}
        icon={<AiOutlineUser fontSize='1.5rem' />}
        ml={isOwnMessage ? '4' : '0'}
        mr={isOwnMessage ? '0' : '4'}
      />
      <Box>
        <Text fontSize="sm" fontWeight="bold">
          {name}
        </Text>
        <Box
          borderRadius="lg"
          p="2"
          bg={isOwnMessage ? '#0B7ED0' : 'gray.100'}
          color={isOwnMessage ? 'white' : 'black'}
          maxWidth="md"
          whiteSpace="pre-wrap"
        >
          <Text fontSize="sm"><Linkify componentDecorator={createLink}>{message}</Linkify></Text>
        </Box>
        <Text fontSize="xs" color="gray.500" mt="1">
          {timestamp}
        </Text>
      </Box>
    </Flex>
  );
};

export default ChatMessage;