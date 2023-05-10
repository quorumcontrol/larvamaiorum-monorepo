import { Box, BoxProps, Text, keyframes } from "@chakra-ui/react"

const getNodeText = (node: React.ReactNode): string => {
  if (!node) {
    return ""
  }
  if (['string', 'number'].includes(typeof node)) return node.toString()
  if (node instanceof Array) return node.map(getNodeText).join('')
  // if (typeof node === 'object' && node) return getNodeText(node.props?.children)
  return ""
}


const appearAnimation = keyframes`
0% {
  transform: translateY(0) skew(2deg, -1deg) scale(3);
  opacity: 0.1;
}
100% {
  transform: translateY(0) skew(0deg, 0deg) scale(1);
  opacity: 0.8;
}
`

const MinervaText: React.FC<BoxProps> = (props) => {
  const { children, ...boxProps } = props
  const text = getNodeText(children)

  return (
    <Box {...boxProps}>
      <Text>
      {text.split(" ").map((word, i) => {
        return (
          <Box as="span" display="inline-block" key={`${word}-${i}`} animation={`${appearAnimation} 1s ease-in-out ${i * 0.25}`}>
            {word}&nbsp;
          </Box>
        )
      })}
      </Text>
    </Box>
  )
}

export default MinervaText
