import { Button, ButtonProps, Icon } from "@chakra-ui/react"
import { BiPlayCircle } from "react-icons/bi"

const StartButton:React.FC<ButtonProps> = (props) => {
  return (
    <Button
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