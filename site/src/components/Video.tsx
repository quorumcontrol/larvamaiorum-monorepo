import { Box, BoxProps } from '@chakra-ui/react';
import React from 'react'
import ipfsToWeb from '../utils/ipfsToWeb';

export function typeFromUrl(animationUrl: string) {
  if (animationUrl === '') {
    return undefined
  }
  if (animationUrl.includes(".mp4")) {
    return "video/mp4";
  }
  if (animationUrl.includes(".webm")) {
    return "video/webm";
  }
  return "video/mp4";
}

interface VideoProps extends BoxProps {
  animationUrl: string
  controls?: boolean
  autoPlay?: boolean
  loop?: boolean
  muted?: boolean
}

const Video: React.FC<VideoProps> = (props) => {
  const { animationUrl, ...videoProps} = props

  return (
    <Box
      as='video'
      minWidth="100%"
      maxWidth="100%"
      maxHeight="100%"
      minHeight="100%"
      objectFit = "contain"
      {...videoProps}
    >
      <source src={ipfsToWeb(animationUrl)} type={typeFromUrl(animationUrl)} />
    </Box>
  );
};

export default Video
