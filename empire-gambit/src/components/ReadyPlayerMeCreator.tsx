import { Box, BoxProps } from "@chakra-ui/react"
import { useEffect, useRef, useState } from "react"
import useIsClientSide from "../hooks/useIsClientSide"

type ReadyPlayerMeCreatorProps = BoxProps & {
  onPicked:(url:string)=>any
  visible?:boolean
}

const ReadyPlayerMeCreator: React.FC<ReadyPlayerMeCreatorProps> = (userProps) => {
  const {onPicked, visible, ...boxProps} = userProps
  const [showIframe, setShowIFrame] = useState(false)
  const iframe = useRef<HTMLIFrameElement>(null)
  const isClient = useIsClientSide()

  useEffect(() => {
    if (!iframe.current || !isClient) {
      return
    }

    window.addEventListener("message", subscribe)
    document.addEventListener("message", subscribe)

    function subscribe(event: any) {
      if (!iframe.current) {
        console.error("tried to subscribe to an non-existant iframe")
        return
      }
      const json = parse(event)

      if (json?.source !== "readyplayerme") {
        return
      }

      // Susbribe to all events sent from Ready Player Me once frame is ready
      if (json.eventName === "v1.frame.ready") {
        iframe.current!.contentWindow!.postMessage(
          JSON.stringify({
            target: "readyplayerme",
            type: "subscribe",
            eventName: "v1.**",
          }),
          "*"
        )
      }

      // Get avatar GLB URL
      if (json.eventName === "v1.avatar.exported") {
        console.log(`Avatar: `, json.data)
        setShowIFrame(false)
        onPicked(json.data.url)
      }

      // Get user id
      if (json.eventName === "v1.user.set") {
        console.log(`User with id ${json.data.id} set: `, json)
      }
    }

    function parse(event: any) {
      try {
        return JSON.parse(event.data)
      } catch (error) {
        return null
      }
    }

    iframe.current.src = "https://crypto-colosseum.readyplayer.me/avatar?frameApi"
    setShowIFrame(true)

    return () => {
      window.removeEventListener("message", subscribe)
      document.removeEventListener("message", subscribe)
    }
  }, [isClient, onPicked])

  if (!visible) {
    return null
  }

  return (
    <Box
      id="readyplayerme"
      as="iframe"
      allow="camera *; microphone *; clipboard-write"
      ref={iframe}
      {...boxProps}
      display={showIframe ? undefined : "none"}
    />
  )
}

export default ReadyPlayerMeCreator
