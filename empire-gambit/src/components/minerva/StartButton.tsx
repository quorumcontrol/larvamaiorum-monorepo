import { Button, ButtonProps, Icon, keyframes } from "@chakra-ui/react"
import { BiPlayCircle } from "react-icons/bi"

const pulseAnimation = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(255, 182, 193, 0.4);
    transform: scale(1);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(255, 182, 193, 0);
    transform: scale(1.1);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 182, 193, 0);
    transform: scale(1);
  }
`

const StartButton:React.FC<ButtonProps> = (props) => {
  return (
    <Button
      animation={`${pulseAnimation} 5s infinite`}
      variant="solid"
      size="lg"
      rightIcon={<Icon as={BiPlayCircle} w={8} h={8} />}
      p={4}
      mt={8}
      {...props}
    >
      Start
    </Button>
  )
}

export default StartButton