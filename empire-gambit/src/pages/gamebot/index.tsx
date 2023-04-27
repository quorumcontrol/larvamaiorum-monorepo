import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  VStack,
  Text,
  Center,
  Flex,
  FormControl,
  Input,
} from "@chakra-ui/react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import RecordButton from "@/components/gamebot/RecordButton";
import { useGetTranscription } from "@/hooks/useGetTranscription";
import { Image, Link } from "@chakra-ui/next-js";
import alienImage from "@/assets/alien.png"
import { ChatMessageProps } from "@/components/gamebot/ChatMessage";
import ReactLinkify from "react-linkify";

const ChatInterface = () => {
  const client = useSupabaseClient()

  const getTranscription = useGetTranscription()

  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<ChatMessageProps[]>([])

  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const messageContent = (txt:string) => {
    // if the txt contains <MESSAGE>{content}</MESSAGE> then return the enclosed content
    // otherwise return the whole message.
    const match = txt.match(/<MESSAGE>([\s\S]*?)<\/MESSAGE>/)
    if (match) {
      return match[1]
    }
    // if maybe the match messed up 
    return txt.replace(/[\s\S]*?<MESSAGE>/, "")
  }

  const _handleSendMessage = async (message:string) => {
    console.log("sending message", message)
    try {
      setLoading(true)

      const newMessage = {
        name: "you",
        content: message,
        isOwnMessage: true,
        role: "user",
        timestamp: new Date().toLocaleTimeString()
      }
      const existingMessages = [...messages]
      const newMessages = existingMessages.concat([newMessage])

      setMessages(newMessages)

      const resp = await client.functions.invoke<{ response: string }>("dprime", {
        body: {
          messages: newMessages.slice(-7),
        },
      })

      console.log(resp)

      if (!resp.data) {
        throw new Error("no data")
      }

      // const audioResp = await client.functions.invoke<{ speech: string }>("voice", {
      //   body: {
      //     text: messageContent(resp.data.response),
      //   },
      // })

      // console.log("audio:", audioResp)

      // const { data: { publicUrl } } = client.storage.from("audio").getPublicUrl(audioResp.data?.speech || "")

      // new Audio(publicUrl).play()

      setMessages((messages) => {
        return [...messages, {
          name: "D Prime",
          role: "assistant",
          content: resp.data?.response || "looks like I had some sort of error, try me again?",
          isOwnMessage: false,
          timestamp: new Date().toLocaleTimeString()
        }]
      })

    } finally {
      setLoading(false)
    }

  }

  const handleAudio = async (audioBlob: Blob) => {
    const transcription = await getTranscription(audioBlob)
    console.log("transcription: ", transcription)
    if (transcription) {
      _handleSendMessage(transcription)
    }
  }

  const handleKeyDown = (evt: React.KeyboardEvent<HTMLInputElement>) => {
    if (evt.key === "Enter") {
      _handleSendMessage(message)
      setMessage("")
    }
  }

  const createLink = (decoratedHref: string, decoratedText: string, key: number) => {
    return <Link href={decoratedHref} key={key} textColor="brand.orange" target="_blank">{decoratedText}</Link>
  }

  return (
    <Box bgColor="#000" minH="100vh" minW="100vw">
      <Center>
        <VStack textColor="#fff">
          <Image src={alienImage} w="256px" h="256px" alt="alien face" borderRadius="50%" />

          {messages.map((message, index) => {
            return (
              <Flex
                flexDirection={message.isOwnMessage ? 'row-reverse' : 'row'}
                alignItems="flex-start"
                mt="4"
                key={`chat-message-${index}`}
              >
                <Box>
                  <Box
                    borderRadius="lg"
                    p="2"
                    maxWidth="md"
                    whiteSpace="pre-wrap"
                  >
                    <Text fontSize="sm" textColor="#fff"><ReactLinkify componentDecorator={createLink}>{messageContent(message.content)}</ReactLinkify></Text>
                  </Box>
                </Box>
              </Flex>
            )
          })}
          {loading && <Text>Loading...</Text>}

          <RecordButton mt="5" onRecord={handleAudio} />

          <FormControl>
            <Input type="text" value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={handleKeyDown}/>
          </FormControl>

          <div ref={chatEndRef} id="endOfChat" />
        </VStack>
      </Center>
  
    </Box>
  );
};

export default ChatInterface;
