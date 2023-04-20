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
  const [started, setStarted] = useState(false)
  const [complete, setComplete] = useState(false)
  const [src, setSrc] = useState<string>()
  const videoElement = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    console.log("trigger: ", trigger)
    if (trigger && !started) {
      console.log("triggering")
      setStarted(true)
      setComplete((isComplete) => (isComplete ? false : isComplete))
    }

    if (started || !complete) {
      console.log('started and !complete')
      return
    }
    // otherwise, let's set a random video src, and reset the complete, play the video
    const randomIndex = Math.floor(Math.random() * videos.length)
    setSrc(videos[randomIndex])
    console.log("settin src: ", videos[randomIndex], started, complete)

    setComplete(false)
  }, [trigger, started, videoElement, complete])

  useEffect(() => {
    if (!videoElement.current || !src || (started && complete)) {
      return
    }

    console.log("setting video src: ", src, started, complete)

    const el = videoElement.current

    const onEnded = () => {
      console.log("set complete")
      setComplete(true)
      if (!trigger) {
        console.log("setting trigger false")
        setStarted(false)
      }
    }

    el.addEventListener("ended", onEnded)

    el.currentTime = 0
    el.play()

    return () => {
      console.log('set complete true from inside useEffect')
      setComplete(true)
      if (!trigger) {
        console.log("setting trigger false in el removal")
        setStarted(false)
      }
      el.removeEventListener("ended", onEnded)
    }

  }, [videoElement, trigger, src, complete, started])

  return (
    <Box
      w="100vw"
      h="100vh"
      pointerEvents="none"
      {...boxProps}
    >
      {started && <Box
        transition={`all 4s ease-in-out`}
        as="video"
        muted
        playsInline
        src={src}
        ref={videoElement}
        w="100%"
        h="100%"
        objectFit="fill"
        opacity={(!started || complete) ? 0 : 0.4}
        filter="blur(5px)"
      />}
    </Box>
  )

}
