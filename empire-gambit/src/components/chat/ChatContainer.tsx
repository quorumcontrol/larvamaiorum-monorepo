import React, { useState } from "react";
import { Box, Container, Spinner, VStack } from "@chakra-ui/react";
import ChatInput from "./ChatInput";
import ChatMessage, { Message } from "./ChatMessage";

const jsonRegex = /{(?:[^{}]|{(?:[^{}]|{(?:[^{}]|{[^{}]*})*})*})*}/

interface ProfileData {
  ready: boolean

  name?: string;
  email?: string;
  skipEmail?: boolean;
  avatar?: boolean;
}

const jsonOnly = (text:string) => {
  const json = text.match(jsonRegex)?.[0]
  return json ? JSON.parse(json) : {} 
}

const ChatUI: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi there! I'm Minerva, goddess of wisdom and war. What can I call you?",
    }
  ]);
  const [profileData, setProfileData] = useState<ProfileData>({ready: false})

  const handleParseName = async (message: string) => {
    setLoading(true)
    try {
      const updatedMessages = [...messages, { role: 'user', content: message }]
      setMessages(updatedMessages);
      console.log("messages: ", updatedMessages)
      const response = await fetch("/api/extract", {
        method: "POST",
        body: JSON.stringify({
          extractionType: "name",
          content: message
        }),
      })
      const resp = jsonOnly((await response.json()).content)
      if (!resp.parseable) {
        return setMessages((prev) => [...prev, { role: 'assistant', content: "I'm sorry, I couldn't understand your name. Can you rephrase that?" }]);
      }
      setProfileData((pd) => ({...pd,  name: resp.name }))
      return setMessages((prev) => [...prev, { role: 'assistant', content: `Thanks! ${resp.name}, may we have your email? This is optional and we won't abuse it. If not just say something like "skip."` }]);
    } catch (err) {
      console.error('error parsing name', err)
      setMessages((prev) => [...prev, { role: 'assistant', content: "I'm sorry, something went wrong" }]);
    } finally {
      setLoading(false)
    }

  };

  const handleParseEmail = async (message: string) => {
    setLoading(true)
    try {
      const updatedMessages = [...messages, { role: 'user', content: message }]
      setMessages(updatedMessages);
      console.log("messages: ", updatedMessages)
      const response = await fetch("/api/extract", {
        method: "POST",
        body: JSON.stringify({
          extractionType: "email",
          content: message
        }),
      })
      const resp = jsonOnly((await response.json()).content)
      console.log("response: ", resp)
      if (resp.skip || !resp.email) {
        setProfileData((pd) => ({...pd, skipEmail: true }))
        return setMessages((prev) => [...prev, { role: 'assistant', content: "No worries, we can come back to that later. Would you like to build your avatar now or jump right into a tutorial?" }]);
      }
      setProfileData((pd) => ({...pd, skipEmail: false, email: resp.email }))
      return setMessages((prev) => [...prev, { role: 'assistant', content: `Thanks! ${profileData.name}, would you like to build your avatar now or jump right into a tutorial?` }]);
    } catch (err) {
      console.error('error parsing name', err)
      setMessages((prev) => [...prev, { role: 'assistant', content: "I'm sorry, something went wrong" }]);
    } finally {
      setLoading(false)
    }
  };

  const handleParseTutorial = async (message: string) => {
    setLoading(true)
    try {
      const updatedMessages = [...messages, { role: 'user', content: message }]
      setMessages(updatedMessages);
      console.log("messages: ", updatedMessages)
      const response = await fetch("/api/extract", {
        method: "POST",
        body: JSON.stringify({
          extractionType: "avatarOrTutorial",
          content: message
        }),
      })
      const resp = jsonOnly((await response.json()).content)
      console.log("response: ", resp)
      if (resp.avatar) {
        setProfileData((pd) => ({...pd, avatar: true, ready: true }))
        return setMessages((prev) => [...prev, { role: 'assistant', content: "Let's do it. One moment. <END>" }]);
      }
      setProfileData((pd) => ({...pd, avatar: false, ready: true }))
      return setMessages((prev) => [...prev, { role: 'assistant', content: `Great. We can come back to the avatar. Let's show you the game. <END>` }]);
    } catch (err) {
      console.error('error parsing name', err)
      setMessages((prev) => [...prev, { role: 'assistant', content: "I'm sorry, something went wrong" }]);
    } finally {
      setLoading(false)
    }
  };

  const handleSendMessage = (message: string) => {
    if (!profileData.name) {
      return handleParseName(message)
    }
    if (!profileData.email && !profileData.skipEmail) {
      return handleParseEmail(message)
    }
    if (!profileData.ready) {
      return handleParseTutorial(message)
    }
    setMessages((prev) => [...prev, { role: 'assistant', content: "<END>Here's where I would send you on your way." }]);
  }

  return (
    <Container maxW="container.md">
      <VStack
        spacing={4}
        borderWidth="1px"
        borderRadius="lg"
        p={4}
        height="70vh"
        overflowY="auto"
      >
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}
        {loading && <Box><Spinner /></Box>}
      </VStack>
      {loading && <Box><Spinner /></Box>}
      <ChatInput onSend={handleSendMessage} loading={loading} />
    </Container>
  );
};

export default ChatUI;