import { Box, BoxProps } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'

const videos = [
  "/videos/fire.mp4",
  "/videos/fireHurricane.mp4",
  "/videos/sparks.mp4",
]

type PageEffectsProps = BoxProps & { trigger: boolean }

export const PageEffects: React.FC<PageEffectsProps> = (props) => {
  const { trigger, ...boxProps } = props
  const [inProgress, setInProgress] = useState(false)
  const [src, setSrc] = useState<string>()
  const videoElement = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    console.log("trigger: ", trigger)
    // const onEnded = () => {
    //   console.log("set complete")
    //   setInProgress(false)
    // }
    const el = videoElement.current
    if (!el) {
      console.log("no el")
      return
    }

    if (trigger && !inProgress) {
      setInProgress(true)
      console.log("triggering")
      // otherwise, let's set a random video src, and reset the complete, play the video
      const randomIndex = Math.floor(Math.random() * videos.length)
      setSrc(videos[randomIndex])
      console.log("settin src")

      el.currentTime = 0
    }

  }, [trigger, inProgress, videoElement])

  return (
    <Box
      w="100vw"
      h="100vh"
      pointerEvents="none"
      {...boxProps}
    >
      <Box
        transition={`all 4s ease-in-out`}
        as="video"
        muted
        playsInline
        autoPlay
        src={src}
        ref={videoElement}
        onEnded={() => setInProgress(false)}
        w="100%"
        h="100%"
        objectFit="fill"
        opacity={(inProgress) ? 0.4 : 0}
        filter="blur(5px)"
      />
    </Box>
  )

}
