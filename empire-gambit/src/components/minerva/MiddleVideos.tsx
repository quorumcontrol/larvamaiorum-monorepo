import { Box, VStack } from "@chakra-ui/react"
import StartButton from "./StartButton"
import { useRef, useState } from "react"

interface MiddleVideosProps {
  loading: boolean
  onStartClick: () => void
}

const MiddleVideos: React.FC<MiddleVideosProps> = ({ loading, onStartClick }) => {
  const [introPlaying, setIntroPlaying] = useState(false)
  const introVideo = useRef<HTMLVideoElement>(null)
  const [introComplete, setIntroComplete] = useState(false)

  const handleStart = () => {
    setIntroPlaying(true)
    introVideo.current?.play()
    onStartClick()
  }

  return (
    <VStack>
      {!introPlaying && (
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
          // opacity={started && !introPlaying ? 1.0 : 0}
          playsInline
          objectFit="cover"
          opacity={loading ? 0.3 : 1.0}
          transition={`all 4s ease-in-out`}
          style={{
            maskImage: "radial-gradient(circle at center, rgba(0, 0, 0, 1) 50%, rgba(0, 0, 0, 0) 85%)",
            "WebkitMaskImage": "radial-gradient(circle at center, rgba(0, 0, 0, 1) 50%, rgba(0, 0, 0, 0) 85%)"
          }}
        />
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

      {!introPlaying && !introComplete && <StartButton onClick={handleStart} />}
    </VStack>

  )

}

export default MiddleVideos