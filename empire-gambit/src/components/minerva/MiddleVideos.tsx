import { Box, Text, VStack } from "@chakra-ui/react"
import StartButton from "./StartButton"
import { useRef, useState } from "react"
import MinervaLoop from "./MinervaLoop"
import { useTokenBalance } from "@/hooks/useTokens"
import { utils } from "ethers"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { isLocalhost } from "@/utils/isLocalhost"
import { useQueryClient } from "react-query"

interface MiddleVideosProps {
  loading: boolean
  onStartClick: () => void
}

const MiddleVideos: React.FC<MiddleVideosProps> = ({ loading, onStartClick }) => {
  const [introPlaying, setIntroPlaying] = useState(false)
  const introVideo = useRef<HTMLVideoElement>(null)
  const [introComplete, setIntroComplete] = useState(false)
  const { data: tokenBalance } = useTokenBalance()
  const queryClient = useQueryClient()

  const client = useSupabaseClient()

  const handleStart = () => {
    setIntroPlaying(true)
    introVideo.current?.play()
    onStartClick()

    // fire and forget
    client.functions.invoke("start-chat", {
      body: {
        chainId: isLocalhost() ? 31337 : 1032942172,
      }
    }).then(({ error }) => {

      if (error) {
        console.error("start-chat error", error)
        return
      }

      queryClient.invalidateQueries({ queryKey: ["token-balance"] })
    })
  }

  return (
    <VStack spacing="8">
      {!introPlaying && !introComplete && (
        <VStack>
          <StartButton onClick={handleStart} />
          <Text fontSize="sm">Uses 1 of your {tokenBalance ? utils.formatEther(tokenBalance) : ""} tokens.</Text>
        </VStack>
      )}
      {!introPlaying && (
        <MinervaLoop loading={loading} />
      )}
      <Box
        display={introPlaying ? "block" : "none"}
        as="video"
        w="485px"
        h="485px"
        borderRadius="50%"
        boxShadow="xl"
        src={"/videos/minerva_welcome.mp4"}
        ref={introVideo}
        onEnded={() => { setIntroPlaying(false); setIntroComplete(true) }}
        playsInline
        objectFit="cover"
        transition={`all 4s ease-in-out`}
        style={{
          maskImage: "radial-gradient(circle at center, rgba(0, 0, 0, 1) 50%, rgba(0, 0, 0, 0) 85%)",
          "WebkitMaskImage": "radial-gradient(circle at center, rgba(0, 0, 0, 1) 50%, rgba(0, 0, 0, 0) 85%)"
        }}
      />
    </VStack>
  )
}

export default MiddleVideos
