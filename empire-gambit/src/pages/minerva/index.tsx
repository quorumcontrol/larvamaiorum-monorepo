import React, { useEffect, useRef, useState } from 'react';
import { Box, Center, HStack, Text, VStack, useDisclosure } from '@chakra-ui/react';

import AppLayout from '@/components/minerva/AppLayout';
import RecordButton from '@/components/minerva/RecordButton';
import { useGetTranscription } from '@/hooks/minerva/useGetTranscription';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import EtherealImage from '@/components/minerva/EtherealImage';
import { useEnvironmentSound } from '@/hooks/minerva/useEnvironmentSound';
import ThankYouModal from '@/components/minerva/ThankYouModal';
import { PageEffects } from '@/components/minerva/PageEffects';

interface Message {
  role: "user" | "assistant"
  content: string
  raw?: string
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

  const [imagePrompt, setImagePrompt] = useState<string>()

  const [history, setHistory] = useState<Message[]>([])

  const historyRef = useRef<HTMLDivElement>(null);

  const [complete, setComplete] = useState(false)

  const [thankYouNft, setThankYouNft] = useState<ThankYouNft>()

  const { start } = useEnvironmentSound()

  const [effectTrigger, setEffectTrigger] = useState(false)

  const scrollToBottom = () => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

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

    const { data: { publicUrl }} = client.storage.from("images").getPublicUrl(data.imagePath)

    setThankYouNft({
      title: data.title,
      description: data.description,
      imageUrl: publicUrl,
    })

    onOpen()
  }


  const handleNewMessage = async (newMessage: Message) => {
    const existing = history

    const card = existing.slice(-1)[0]?.card
    if (card) {
      setImagePrompt(`The tarot card: ${card}`)
    }

    setHistory((prev) => [...prev, newMessage])

    const resp = await client.functions.invoke("chat", {
      body: {
        history: [...existing.map((msg) => {
          return {
            role: msg.role,
            content: msg.raw || msg.content
          }
        }), card ? { ...newMessage, content: `I drew the ${card} card.\n\n${newMessage.content}` } : newMessage],
      }
    })

    console.log(resp)

    if (resp.data.complete) {
      setComplete(true)
      fetchGift()
    }

    if (!card && resp.data.image) {
      setImagePrompt(resp.data.raw)
      setEffectTrigger(false)
    } else {
      // do an effect :)
      setEffectTrigger(true)
    }

    setHistory((prev) => [...prev, { role: "assistant", content: resp.data.response, raw: resp.data.raw, card: resp.data.card, image: resp.data.image }])

    const { data: { publicUrl } } = client.storage.from("audio").getPublicUrl(resp.data.speech)

    // const path = await waitForSpeech(resp.data.speech.uuid)
    new Audio(publicUrl).play()
    setLoading(false)
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

            <EtherealImage prompt={imagePrompt} />
            <VStack spacing="6">
              <Box
                as="video"
                w="485px"
                h="485px"
                borderRadius="50%"
                boxShadow="xl"
                src={loading ? "/videos/psychedelic.mp4" : "/videos/minervaLoop.mp4"}
                autoPlay
                muted
                loop
                objectFit="cover"
                opacity={loading ? 0.3 : 1.0}
                transition={`all 4s ease-in-out`}
                style={{
                  maskImage: "radial-gradient(circle at center, rgba(0, 0, 0, 1) 50%, rgba(0, 0, 0, 0) 85%)",
                  "WebkitMaskImage": "radial-gradient(circle at center, rgba(0, 0, 0, 1) 50%, rgba(0, 0, 0, 0) 85%)"
                }}
              />
              {!complete && <RecordButton onRecord={handleAudio} loading={loading} onFirstClick={start} />}
              {complete && <Text fontSize="xl" color="white">Thank you for sharing your journey.</Text>}
              <Box
                ref={historyRef}
                maxH="15em"
                w="lg"
                fontSize={"sm"}
                mt={4}
                px={4}
                overflowY="auto"
                whiteSpace="pre-wrap"
                color="white"
                bgColor="rgba(0, 0, 0, 0.8)"
                css={{
                  '&::-webkit-scrollbar': {
                    width: '6px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                  },
                }}
              >
                {history.map((message, index) => {
                  return (
                    <Box key={index} mb={2}>
                      <Text fontWeight="bold" mr={2}>
                        {message.role === "user" ? "You" : "Minerva"}
                      </Text>
                      <Text>{message.content}</Text>
                    </Box>
                  )
                })
                }
              </Box>
            </VStack>


            <EtherealImage prompt={imagePrompt} />

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
