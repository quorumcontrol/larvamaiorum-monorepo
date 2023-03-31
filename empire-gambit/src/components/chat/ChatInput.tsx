import React, { useState } from 'react';
import { HStack, Input, IconButton, useToast, Spinner } from '@chakra-ui/react';
import { ArrowUpIcon } from '@chakra-ui/icons';

const ChatInput:React.FC<{onSend:(msg:string)=>any, loading?:boolean}> = ({ onSend, loading }) => {
  const [input, setInput] = useState('');
  const toast = useToast();

  const handleSend = () => {
    if (!input.trim()) {
      toast({
        title: 'Cannot send empty message.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    onSend(input);
    setInput('');
  };

  const handleKeyDown:React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === 'Enter') {
      handleSend()
    }
  };

  return (
    <HStack>
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message"
      />
      {loading && <Spinner />}
      {!loading && <IconButton
        icon={<ArrowUpIcon />}
        onClick={handleSend}
        aria-label="Send message"
      />}
    </HStack>
  );
};

export default ChatInput