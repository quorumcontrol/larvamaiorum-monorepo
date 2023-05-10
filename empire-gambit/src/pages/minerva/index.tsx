import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Center, HStack, Text, VStack, useDisclosure } from '@chakra-ui/react';

import AppLayout from '@/components/minerva/AppLayout';
import RecordButton from '@/components/minerva/RecordButton';
import { useGetTranscription } from '@/hooks/minerva/useGetTranscription';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import EtherealImage from '@/components/minerva/EtherealImage';
import { useEnvironmentSound } from '@/hooks/minerva/useEnvironmentSound';
import ThankYouModal from '@/components/minerva/ThankYouModal';
import { PageEffects } from '@/components/minerva/PageEffects';
import { createParser, ParsedEvent, ReconnectInterval } from 'eventsource-parser'
import { useImageFromPrompt } from '@/hooks/useImageFromPrompt';
import MinervaText from '@/components/minerva/MinervaText';
import MiddleVideos from '@/components/minerva/MiddleVideos';
import { useSpeechQueue } from '@/hooks/minerva/useSpeechQueue';

const sayRegex = /<MESSAGE>([\s\S]*?)(<\/?MESSAGE>|<\/[\s\S]*|$)/s
const actionRegex = /<ACTION>([\s\S]*?)<\/ACTION>/

async function requestMicrophonePermission(): Promise<boolean> {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    return true; // User has approved microphone access
  } catch (e) {
    console.error('Microphone access denied', e);
    return false; // User has denied microphone access
  }
}

interface Message {
  role: "user" | "assistant"
  content: string
  raw?: string
  action?: string
  card?: {
    name: string
  }
  image?: {
    base64: string
  }
  complete?: boolean
}

interface ThankYouNft {
  title: string
  description: string
  imageUrl: string
}

const FortuneTeller = () => {
  const [loading, setLoading] = useState(false)
  const getTranscription = useGetTranscription()
  const client = useSupabaseClient()

  const { isOpen, onClose, onOpen } = useDisclosure()

  const { queueSpeech } = useSpeechQueue()

  const { getImage } = useImageFromPrompt()

  const [action, setAction] = useState<string>("")

  const [drawnCard, setDrawnCard] = useState<{ image: string, name: string }>()

  const [src, setSrc] = useState<string>()

  const [history, setHistory] = useState<Message[]>([])

  // const historyRef = useRef<HTMLDivElement>(null);

  const [complete, setComplete] = useState(false)

  const [thankYouNft, setThankYouNft] = useState<ThankYouNft>()

  const [started, setStarted] = useState(false)

  const { start } = useEnvironmentSound()

  const [effectTrigger, setEffectTrigger] = useState(false)

  const lastUserMessage = history.reverse().find((msg) => msg.role === "user")

  const fetchGift = async () => {
    const { data, error } = await client.functions.invoke("gift", {
      body: {
        history: history.map((msg) => {
          return {
            role: msg.role,
            content: msg.content
          }
        })
      }
    })
    if (error) {
      console.log(error)
      return
    }

    const { data: { publicUrl } } = client.storage.from("images").getPublicUrl(data.imagePath)

    setThankYouNft({
      title: data.title,
      description: data.description,
      imageUrl: publicUrl,
    })

    onOpen()
  }


  const drawCard = async () => {
    const { data: { card, image }, error } = await client.functions.invoke("card")
    if (error) {
      console.error("error getting card", error)
      throw error
    }

    const { data: { publicUrl } } = client.storage.from("images").getPublicUrl(image)

    setDrawnCard({
      image: publicUrl,
      name: card,
    })
  }

  const updateImage = async () => {
    const src = await getImage(history.slice(-3, -1).map((msg) => msg.content).join("\n\n"))
    setSrc(src)
  }

  useEffect(() => {
    console.log("new action", action)
    switch (action.toLowerCase()) {
      case "performeffect":
        setEffectTrigger(false)
        updateImage()
        break;
      case "drawcard":
        console.log("drawing card")
        drawCard()
        break;
      case "complete":
        console.log("complete")
        setComplete(true)
        fetchGift()
        break;
      case "nothing":
        console.log("setting effect trigger to true")
        setEffectTrigger(true)
        break;
    }
  }, [action])

  const speak = (buffer:string, spokenSet: Set<string>, isOver=false) => {
    const sentenceRegex = /[\.\?!\n]\s+/
    const sentences = buffer.split(sentenceRegex)
    for (const sentence of sentences) {
      // if we're over then speak even if the sentence doesn't have a break point.
      // otherwise, only speak full sentences.
      if (!isOver && !sentence.match(sentenceRegex)) {
        continue
      }
      // ignore anything we've already spoken
      if (spokenSet.has(sentence)) {
        continue
      }
      spokenSet.add(sentence)
      queueSpeech(sentence)
    }
  }

  const parseMessage = () => {
    setHistory((history) => {
      const last = history.slice(-1)[0]
      if (!last || (last && last.role === "user")) {
        // console.log("not last: ", last)
        return history
      }
      // console.log("parsing", last.raw)
      const actionMatch = last?.raw?.match(actionRegex)
      const messageMatch = last?.raw?.match(sayRegex)

      if (messageMatch) {
        last.content = messageMatch[1].trim()
      } else {
        // console.log("no msg: ", last.raw)
      }

      if (actionMatch) {
        // console.log("action: ", actionMatch[1])
        last.action = actionMatch[1].trim()
        setAction((prev) => {
          if (prev === last.action) {
            return prev
          }
          return last.action!
        })
      }

      return [
        ...history.slice(0, -1),
        {
          ...last,
        }
      ]
    })
  }

  const handleNewMessage = async (newMessage: Message) => {
    const existing = history

    console.log("new message: ", newMessage)

    setHistory((prev) => [...prev, newMessage])

    const historyParam = [...existing.map((msg) => {
      return {
        role: msg.role,
        content: msg.raw || msg.content
      }
    }), drawnCard ? { ...newMessage, content: `I drew the ${drawnCard.name} card.\n\n${newMessage.content}` } : newMessage]

    const session = await client.auth.getSession()

    console.log("history: ", historyParam)

    const stream = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/streaming-chat`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.data.session?.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ history: historyParam })
    })

    if (!stream.body) {
      throw new Error("missing body")
    }

    let buffer = ""

    const spokenSentences = new Set<string>()

    function onParse(event: ParsedEvent | ReconnectInterval) {
      if (event.type === 'event') {
        if (event.data === "[DONE]") {
          console.log("done")
          setLoading(false)
          speak(buffer, spokenSentences, true)
          return
        }
        const delta = JSON.parse(event.data).choices[0].delta.content
        // console.log("delta", delta)
        if (!delta) {
          return
        }
        buffer += delta
        setHistory((prev) => {
          const last = prev.slice(-1)[0]
          if (!last || last.role !== "assistant") {
            return [
              ...prev,
              { role: "assistant", raw: delta, content: "" }
            ]
          }
          return [
            ...prev.slice(0, -1),
            {
              ...last,
              raw: buffer,
              content: ""
            }
          ]
        })

        parseMessage()
        speak(buffer, spokenSentences)
      } else if (event.type === 'reconnect-interval') {
        console.log('We should set reconnect interval to %d milliseconds', event.value)
      }
    }

    const parser = createParser(onParse)
    const decoder = new TextDecoderStream()

    const sseStream = stream.body.pipeThrough(decoder).getReader()

    let done, value;
    while (!done) {
      ({ value, done } = await sseStream.read())
      if (!done && value) {
        parser.feed(value)
      }
    }
  }

  const handleAudio = async (audioBlob: Blob) => {
    setLoading(true)
    const transcription = await getTranscription(audioBlob)
    if (!transcription) {
      throw new Error("missing transcription")
    }
    const newMessage: Message = { role: "user", content: transcription }

    handleNewMessage(newMessage)
  }

  const handleStart = () => {
    requestMicrophonePermission()
    start()
    setEffectTrigger(true)
    setStarted(true)
  }

  return (
    <AppLayout>
      <PageEffects
        position="absolute"
        bottom="0"
        left="0"
        trigger={effectTrigger}
      />

      <ThankYouModal title={thankYouNft?.title ?? ""} description={thankYouNft?.description ?? ""} imageUrl={thankYouNft?.imageUrl ?? ""} isOpen={isOpen} onClose={onClose} />

      <Box bg="brand.background" minH="100vh" p={4}>
        <Center flexDirection="column" h="100%">
          <HStack spacing="xl">

            <EtherealImage src={drawnCard?.image || src} />
            <VStack spacing="6">
              <MiddleVideos onStartClick={handleStart} loading={loading} />
              <Box maxW="400px">
                {history.slice(-1)[0]?.role === "assistant" && <MinervaText>{history.slice(-1)[0]?.content}</MinervaText>}
              </Box>

              {!complete && started && <RecordButton onRecord={handleAudio} loading={loading} />}
              {complete && <Text fontSize="xl" color="white">Thank you for sharing your journey.</Text>}
              <Center
                maxH="5em"
                w="lg"
                fontSize={"sm"}
                mt={4}
                px={4}
                overflowY="auto"
                whiteSpace="pre-wrap"
                color="white"
                bgColor="rgba(0, 0, 0, 0.8)"

              >
                {lastUserMessage && (
                  <Box mb={2}>
                    <Text>You: {lastUserMessage.content}</Text>
                  </Box>
                )}
              </Center>
            </VStack>


            <EtherealImage src={drawnCard?.image || src} />

          </HStack>
        </Center>
      </Box>
      <Box
        as="video"
        src="/videos/smoke_low.mp4"
        autoPlay
        muted
        position="absolute"
        bottom="0"
        left="0"
        h="100vh"
        width="100vw"
        objectFit="fill"
        opacity={loading ? 0.6 : 0.3}
        loop
        pointerEvents="none"
        transition={`all 1.5s ease-in-out`}
      />
    </AppLayout>
  );
};

export default FortuneTeller;
