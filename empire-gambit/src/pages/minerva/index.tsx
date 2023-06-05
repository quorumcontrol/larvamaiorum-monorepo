import React, { useEffect, useState } from 'react';
import { Box, Center, HStack, Heading, Image, Stack, Text, VStack } from '@chakra-ui/react';
import AppLayout from '@/components/minerva/AppLayout';
import RecordButton from '@/components/minerva/RecordButton';
import { useGetTranscription } from '@/hooks/minerva/useGetTranscription';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import EtherealImage from '@/components/minerva/EtherealImage';
import { useEnvironmentSound } from '@/hooks/minerva/useEnvironmentSound';
import { PageEffects } from '@/components/minerva/PageEffects';
import { createParser, ParsedEvent, ReconnectInterval } from 'eventsource-parser'
import { useImageFromPrompt } from '@/hooks/useImageFromPrompt';
import MinervaText from '@/components/minerva/MinervaText';
import MiddleVideos from '@/components/minerva/MiddleVideos';
import { useSpeechQueue } from '@/hooks/minerva/useSpeechQueue';
import { useAccount } from 'wagmi';
import UserConversation from '@/components/minerva/UserConversation';
import Head from 'next/head';

const sayRegex = /<MESSAGE>([\s\S]*?)(<\/?MESSAGE>|<\/[\s\S]*|$)/s
const actionRegex = /<ACTION>([\s\S]*?)<\/ACTION>/
const sentenceRegex = /[\.\?!\n]\s+/

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

function getEdgeFunctionUrl() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/$/, '')
  const isPlatform = supabaseUrl.match(/(supabase\.co)|(supabase\.in)/)

  if (isPlatform) {
    const [schemeAndProjectId, domain, tld] = supabaseUrl.split('.')
    return `${schemeAndProjectId}.functions.${domain}.${tld}`
  } else {
    return `${supabaseUrl}/functions/v1`
  }
}

const FortuneTeller = () => {
  const [loading, setLoading] = useState(false)
  const getTranscription = useGetTranscription()
  const client = useSupabaseClient()

  const { address } = useAccount()

  const { queueSpeech, setOnEnded } = useSpeechQueue()

  const { getImage } = useImageFromPrompt()

  const [action, setAction] = useState<string>("")

  const [drawnCard, setDrawnCard] = useState<{ image: string, name: string }>()

  const [src, setSrc] = useState<string>()

  const [history, setHistory] = useState<Message[]>([])

  const [complete, setComplete] = useState(false)

  const [thankYouNft, setThankYouNft] = useState<ThankYouNft>()

  const [started, setStarted] = useState(false)

  const { start } = useEnvironmentSound()

  const [effectTrigger, setEffectTrigger] = useState(false)

  const lastUserMessage = [...history].reverse().find((msg) => msg.role === "user")

  const fetchGift = async () => {
    const { data, error } = await client.functions.invoke("gift", {
      body: {
        to: address,
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
  }

  const drawCard = async () => {
    const { data: { card, path }, error } = await client.functions.invoke("images", {
      body: {
        drawCard: true
      }
    })
    if (error) {
      console.error("error getting card", error)
      throw error
    }

    const { data: { publicUrl } } = client.storage.from("images").getPublicUrl(path)

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

  const speak = (buffer: string, spokenSet: Set<string>, isOver = false) => {
    const messageMatch = buffer.match(sayRegex)
    if (!messageMatch) {
      return
    }

    const sentences = messageMatch[1].split(sentenceRegex)
    for (const sentence of sentences) {
      if (sentence.length < 5) {
        // ignore trailing stuff
        continue
      }
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

  const isBufferValid = (buffer: string, historyParam: { role: string, content: string }[]) => {
    if (buffer.match(sayRegex) && buffer.match(actionRegex)) {
      return true
    }
    console.error("minerva messed up", buffer)
    // drop the last message from minerva, the one that was just streaming
    setHistory((history) => history.slice(0, -1))
    //adjust the last history param to add context to what the user said
    const last = historyParam[historyParam.length - 1]

    const newParam = [...historyParam.slice(0, -1), {
      ...last,
      content: `${last.content}\n\nMAKE SURE TO RESPOND with both <ACTION></ACTION> and <MESSAGE></MESSAGE> tags from the system prompt.`
    }]

    handleStream(newParam)
  }

  const handleStream = async (historyParam: { role: string, content: string }[]) => {
    const session = await client.auth.getSession()
    if (!session.data.session?.access_token) {
      console.error("missing access token, session: ", session)
      throw new Error("missing access token")
    }

    const stream = await fetch(`${getEdgeFunctionUrl()}/streaming-chat`, {
      method: "POST",
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
          if (isBufferValid(buffer, historyParam)) {
            setOnEnded(() => {
              setLoading(false)
            })
            speak(buffer, spokenSentences, true)
          }
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

    // only draw once
    if (drawnCard) {
      setDrawnCard(undefined)
    }

    console.log("history: ", historyParam)
    handleStream(historyParam)
  }

  const handleTextSubmit = async (text: string) => {
    setLoading(true)
    const newMessage: Message = { role: "user", content: text }
    handleNewMessage(newMessage)
  }

  const handleAudio = async (audioBlob: Blob) => {
    setLoading(true)
    const transcription = await getTranscription(audioBlob)
    if (!transcription) {
      console.error("missing transcription")
      setLoading(false)
      return
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
      <Head>
        <meta property="og:url" content="https://empiregambit.com/minerva" />
      </Head>
      <PageEffects
        position="absolute"
        bottom="0"
        left="0"
        trigger={effectTrigger}
      />

      <Box bg="brand.background" minH="100vh" p={4}>
        <Center flexDirection="column" h="100%">
          {!started && <Heading textAlign="center">Minerva, the fate teller</Heading>}
          {thankYouNft && (
            <Stack spacing="8" py="8" w={["100vw", "3xl"]} direction={["column", "row"]}>
              <Image src={thankYouNft.imageUrl} w="256px" height="355px" alt={`Your NFT image: ${thankYouNft.title}`} objectFit="contain" />
              <VStack alignItems="left">
                <Heading>{thankYouNft.title}</Heading>
                <Text>{thankYouNft.description}</Text>
                <Text fontSize="sm" pt="8">Minerva offers you this token of her appreciation as a digital collectible sent to your wallet. Thank you for sharing your journey.</Text>
              </VStack>
            </Stack>
          )}
          {!thankYouNft && (
            <HStack spacing="xl">

              <EtherealImage src={drawnCard?.image || src} display={["none", "block"]} />

              <VStack spacing="6">
                <MiddleVideos onStartClick={handleStart} loading={loading} />
                {history.slice(-1)[0]?.role === "assistant" && <MinervaText maxW="400px">{history.slice(-1)[0]?.content}</MinervaText>}

                {!complete && started && <UserConversation onRecord={handleAudio} loading={loading} onTextSubmit={handleTextSubmit} />}
                {complete && <Text fontSize="xl" color="white">Thank you for sharing your journey.</Text>}
                {lastUserMessage && (
                  <Box mb={2}>
                    <Text>You: {lastUserMessage.content}</Text>
                  </Box>
                )}
              </VStack>

              <EtherealImage src={drawnCard?.image || src} display={["none", "block"]} />

            </HStack>
          )}
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
