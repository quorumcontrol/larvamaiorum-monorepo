import {
  Modal,
  ModalFooter,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Heading,
  ModalProps,
  Button,
  Stack,
  Box,
  Text,
  VStack,
} from "@chakra-ui/react";
import Image from "next/image";
import border from "../../../src/utils/dashedBorder";
import berserkSrc from "../../../assets/images/cards/berserk_test.png";

interface PickCardModalProps {
  isOpen: ModalProps["isOpen"];
  onClose: ModalProps["onClose"];
}

const PickCardModal: React.FC<PickCardModalProps> = (props) => {
  return (
    <Modal {...props}>
      <ModalOverlay zIndex={4_000_002}/>
      <ModalContent p="6" bg="brand.background" maxW="1200px" zIndex={4_000_002}>
        <ModalBody backgroundImage={border} p="6">
          <Heading>Pick a card</Heading>
          <Stack direction={["column", "row"]} spacing="10">
            <Box bgColor="green" p="10" maxW="300px" borderRadius="10">
              <VStack>
                <Image
                  height="200px"
                  width="200px"
                  src={berserkSrc}
                  objectFit="contain"
                  alt="an image for the berserk card, a viking head."
                />
                <Heading size="lg">Berserk</Heading>
                <Text textAlign="center">
                  Gives your warrior +1000 attack at the cost of 500 defense and
                  500 health points.
                </Text>
              </VStack>
            </Box>
            <Box bgColor="red" p="10" maxW="300px" borderRadius="10">
              <VStack>
                <Image
                  height="200px"
                  width="200px"
                  src={berserkSrc}
                  objectFit="contain"
                  alt="an image for the berserk card, a viking head."
                />
                <Heading size="lg">Evade</Heading>
                <Text textAlign="center">
                  Escape the next battle you&apos;re in.
                </Text>
              </VStack>
            </Box>
            <Box bgColor="orange" p="10" maxW="300px" borderRadius="10">
              <VStack>
                <Image
                  height="200px"
                  width="200px"
                  src={berserkSrc}
                  objectFit="contain"
                  alt="an image for the berserk card, a viking head."
                />
                <Heading size="lg">Thief</Heading>
                <Text textAlign="center">
                  No need to battle, just steal 10% of your opponent&apos;s gump.
                </Text>
              </VStack>
            </Box>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={props.onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PickCardModal;
