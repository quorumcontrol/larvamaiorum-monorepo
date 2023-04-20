import { Box, BoxProps, keyframes, Image } from "@chakra-ui/react"
import { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

type EtheralImageProps = BoxProps & {
  prompt?: string
}

const opacityTransitionTime = 3

const floatAnimation = keyframes`
  0%, 100% {
    transform: translateY(0) skew(0deg, 0deg);
  }
  25% {
    transform: translateY(-10px) skew(1deg, 0deg);
  }
  50% {
    transform: translateY(0) skew(0deg, 0deg);
  }
  75% {
    transform: translateY(-10px) skew(0deg, 1deg);
  }
`

const EtherealImage: React.FC<EtheralImageProps> = (props) => {
  const { prompt, ...boxProps } = props
  const client = useSupabaseClient()

  const [artworkSource, setArtworkSource] = useState<string>();
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    // return
    if (!prompt || !client.functions) {
      return
    }

    let timeout: ReturnType<typeof setTimeout> | undefined

    const doAsync = async () => {
      console.log("prompt with: ", prompt)
      setOpacity(0)
      const resp = await client.functions.invoke("images", {
        body: {
          prompt,
        }
      })

      console.log("image response: ", resp)

      if (!resp.data) {
        console.error("error getting images: ", resp.error)
        return
      }

      const { path } = resp.data

      const { data: { publicUrl } } = client.storage.from("images").getPublicUrl(path)

      setArtworkSource(publicUrl)
      // timeout = setTimeout(() => {
      //   timeout = undefined
      //   setOpacity(0.9)
      // }, opacityTransitionTime * 1000)

    }
    doAsync()

    return () => {
      if (timeout) {
        clearTimeout(timeout)
      }
    }

  }, [prompt, client])


  if (!artworkSource) {
    return <Box
      maxW="md"
      borderRadius="lg"
      boxShadow="xl"
      opacity={opacity}
      animation={`${floatAnimation} 7s ease-in-out infinite`}
      transition={`all ${opacityTransitionTime}s ease-in-out`}
      {...boxProps}
    >
      <Box w="512px" h="704px" />
    </Box>

  }

      return (
      <Box
        w="512px"
        h="704px"  
      
        // boxShadow="xl"
        animation={`${floatAnimation} 7s ease-in-out infinite`}
        // boxShadow="0 0 20px 20px rgb(0,0,0,1) inset"
        {...boxProps}
      >
        <Image
          opacity={opacity}
          transition={`all ${opacityTransitionTime}s ease-in-out`}

          borderRadius="2xl"
          onLoad={() => {
            console.log('image load')
            setOpacity(0.9)
          }}
          src={artworkSource}
          alt="Card Placeholder"
          width="512px"
          height="704px"
          objectFit="contain"
          style={{
            maskImage: "radial-gradient(ellipse at center, rgba(0, 0, 0, 1) 50%, rgba(0, 0, 0, 0) 85%)",
            "WebkitMaskImage": "radial-gradient(ellipse at center, rgba(0, 0, 0, 1) 50%, rgba(0, 0, 0, 0) 85%)"
          }}
        />
      </Box>
      )

}

      export default EtherealImage