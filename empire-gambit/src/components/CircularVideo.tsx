import { Box, BoxProps, Icon } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { TbPlayerPlayFilled } from "react-icons/tb";

interface CircularVideoProps {
  src: string
}

type VideoProps = BoxProps & React.ComponentPropsWithoutRef<"video">

const CircularVideo: React.FC<CircularVideoProps & VideoProps> = ({ src, w, width, h, height, ...boxProps }) => {
  const [playing, setPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const onClick = () => {
    console.log('click')
    if (!videoRef.current) {
      console.log("nope")
      return
    }
    videoRef.current.play()
  }

  useEffect(() => {
    if (!videoRef.current) {
      return
    }

    const current = videoRef.current

    const onEnded = () => {
      setPlaying(false)
    }

    const onPlay = () => {
      setPlaying(true)
    }

    current.addEventListener('ended', onEnded)
    current.addEventListener('play', onPlay)

    return () => {
      current?.removeEventListener('ended', onEnded)
      current?.removeEventListener('play', onPlay)
    }
  }, [videoRef])

  return (
    <Box
      w={w || width || "384px"}
      h={h || height || "384px"}
      position="relative"
      display="table"
    >
      <Box
        as="video"
        w="100%"
        h="100%"
        borderRadius="50%"
        boxShadow="xl"
        src={src}
        playsInline
        objectFit="cover"
        transition={`all 4s ease-in-out`}
        ref={videoRef}
        style={{
          maskImage: "radial-gradient(circle at center, rgba(0, 0, 0, 1) 50%, rgba(0, 0, 0, 0) 85%)",
          "WebkitMaskImage": "radial-gradient(circle at center, rgba(0, 0, 0, 1) 50%, rgba(0, 0, 0, 0) 85%)"
        }}

        {...boxProps}
      />
      {!playing && (
        <Box
          position={"absolute"}
          boxSize="64px"
          margin="auto"
          top="0"
          left="0"
          right="0"
          bottom="0"
          onClick={onClick}
        >
          <Icon
            as={TbPlayerPlayFilled}
            boxSize="100%"
          />
        </Box>
      )}
    </Box>
  )
}

export default CircularVideo
