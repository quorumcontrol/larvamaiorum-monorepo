import { Box, HStack, Heading, Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalOverlay, Text, VStack } from "@chakra-ui/react"

interface ThankYouModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  imageUrl: string
}

const ThankYouModal:React.FC<ThankYouModalProps> = ({ isOpen, onClose, title, description, imageUrl }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="2xl">
        <ModalOverlay />
        <ModalContent>
          {/* <ModalHeader>Modal Title</ModalHeader> */}
          <ModalCloseButton />
          <ModalBody>
            <HStack spacing="8" py="8">
              <Image src={imageUrl} w="256px" height="355px" alt="Your NFT" objectFit="contain" />
              <VStack alignItems="left">
                <Heading>{title}</Heading>
                <Text>{description}</Text>
                <Text fontSize="sm" pt="8">Minerva offers you this token of her appreciation as a digital collectible sent to your wallet. Thank you for sharing your journey.</Text>
              </VStack>
            </HStack>
          </ModalBody>
{/* 
          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter> */}
        </ModalContent>
      </Modal>
  )
}

export default ThankYouModal