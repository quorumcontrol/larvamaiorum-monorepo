import { Box } from "@chakra-ui/react"


const MinervaLoop: React.FC<{loading?: boolean}> = ({ loading }) => {
  return (
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
      playsInline
      objectFit="cover"
      opacity={loading ? 0.3 : 1.0}
      transition={`all 4s ease-in-out`}
      style={{
        maskImage: "radial-gradient(circle at center, rgba(0, 0, 0, 1) 50%, rgba(0, 0, 0, 0) 85%)",
        "WebkitMaskImage": "radial-gradient(circle at center, rgba(0, 0, 0, 1) 50%, rgba(0, 0, 0, 0) 85%)"
      }}
    />
  )
}

export default MinervaLoop