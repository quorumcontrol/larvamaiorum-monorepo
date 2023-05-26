import { Box, BoxProps } from "@chakra-ui/react"
import { useEffect, useRef, useState } from "react"
import useIsClientSide from "../hooks/useIsClientSide"
import { AvatarCreatorViewer } from '@readyplayerme/rpm-react-sdk';

type ReadyPlayerMeCreatorProps = BoxProps & {
  onPicked: (url: string) => any
  visible?: boolean
}

const ReadyPlayerMeCreator: React.FC<ReadyPlayerMeCreatorProps> = (userProps) => {
  const { onPicked, visible, ...boxProps } = userProps

  const handleOnAvatarExported = (url: string) => {
    console.log(`Avatar URL is: ${url}`)
    onPicked(url)
  }

  if (!visible) {
    return null
  }

  return (
    <Box {...boxProps}>
      <AvatarCreatorViewer
        subdomain="crypto-colosseum"
        onAvatarExported={handleOnAvatarExported}
        editorConfig={{
          quickStart: true,
          clearCache: true,
        }}
      />

    </Box>
  )
}

export default ReadyPlayerMeCreator
