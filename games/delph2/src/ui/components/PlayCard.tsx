import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  keyframes,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from "@chakra-ui/react"
import { useState } from "react"
import { TbShieldCheckered } from "react-icons/tb"
import { PLAY_CARD_EVT } from "../../game"
import { Card, CardProps } from "../../main-site-components/Card"
import CardPicker from "../../main-site-components/CardPicker"
import { Item } from "../../syncing/schema/DelphsTableState"
import { usePlayCanvasContext } from "./appProvider"
import useCurrentPlayer from "./hooks/useCurrentPlayer"
import useInventory from "./hooks/useInventory"

const pulse = keyframes`
  0% {transform: scale(1.0);}
  50% {transform: scale(1.15);}
  100% {transform: scale(1.0);}
`

const PlayCard: React.FC = () => {
  // const [showModal, setShowModal] = useState(false)
  const { app } = usePlayCanvasContext()
  const player = useCurrentPlayer()
  const inventory = useInventory(player)
  console.log("inv: ", inventory)

  // const onSelected = (identifiers: string[]) => {
  //   console.log("selected: ", identifiers, cards)
  //   onModalClose()
  //   app.fire(PLAY_CARD_EVT, cards[identifiers[0]])
  // }

  // const onButtonClick = (evt:React.MouseEvent<HTMLDivElement, MouseEvent>) => {
  //   evt.stopPropagation()
  //   setShowModal(true)
  // }
  const onButtonClick = (evt:React.MouseEvent<HTMLDivElement, MouseEvent>, card:Item) => {
    evt.stopPropagation()
    app.fire(PLAY_CARD_EVT, card)
    // setShowModal(true)
  }

  // const onModalClose = () => {
  //   setShowModal(false)
  // }

  return (
    <>
      <HStack>
        {inventory.map((item, i) => {
          return (
            <Box key={`card-${item.identifier}-${i}`}>
              <Card card={item} width={["150px", "150px", "150px"]} showCost onMouseDown={(evt) => onButtonClick(evt, item)} />
            </Box>
          )
        })}
      </HStack>
      {/* <Modal isOpen={showModal} onClose={onModalClose}>
        <ModalOverlay />
        <ModalContent minW="40vw" bgColor="rgba(0,0,0,0.6)" backdropBlur="2px">
          <ModalHeader>Pick Card</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <CardPicker cards={cards} maxSelected={1} onSelected={onSelected} />
          </ModalBody>

          <ModalFooter>
            <Button mr={3} onClick={onModalClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal> */}
      {/* <VStack
        onMouseDown={onButtonClick}
        animation={`${pulse} infinite 3s linear`}
        cursor="pointer"
        p={0}
      >
        <Flex
          justifyContent="center"
          alignItems="center"
          alignContent="center"
          p={4}
          borderRadius="120px"
          bgColor="brand.orange"
        >
          <Icon as={TbShieldCheckered} h={["32px", "32px", "32px", "64px"]} w={["32px", "32px", "32px", "64px"]} />
        </Flex>
        <Heading size={["lg", "lg", "lg", "2xl"]}>Play Card</Heading>
      </VStack> */}
    </>
  )
}

export default PlayCard
