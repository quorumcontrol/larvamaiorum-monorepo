import { useToast } from "@chakra-ui/react"
import { useEffect } from "react"
import { Messages, ToastMessage } from "../../syncing/schema/PickleChessState"
import { usePlayCanvasContext } from "./appProvider"


const Toaster:React.FC = () => {
  const { app } = usePlayCanvasContext()
  const toast = useToast()

  useEffect(() => {
    console.log("subscribing to toast")
    app.on(Messages.toast, (msg: ToastMessage) => {
      console.log("toast", msg)
      toast({
        position: "top-right",
        title: "Hint",
        description: msg.text,
        isClosable: true,
        duration: 30_000,
      })
    })
  }, [app])

  return null
}

export default Toaster