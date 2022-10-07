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
  Spinner,
} from "@chakra-ui/react";
import Image, { StaticImageData } from "next/image";
import border from "../utils/dashedBorder";
import berserkSrc from "../../assets/images/cards/berserk_test.png";
import { GameRunner } from "../hooks/gameRunner";
import { getIdentifier, itemsByIdentifier } from "../boardLogic/items";
import { usePlayCardMutation } from "../hooks/useDelphsTable";

const images: Record<number, StaticImageData> = {
  1: berserkSrc,
  2: berserkSrc,
  3: berserkSrc,
};

interface PickCardModalProps {
  isOpen: ModalProps["isOpen"];
  onClose: ModalProps["onClose"];
  runner?: GameRunner;
  player?: string;
}

const PickCardModal: React.FC<PickCardModalProps> = ({
  isOpen,
  onClose,
  runner,
  player,
}) => {
  const mutation = usePlayCardMutation(runner?.tableId);

  const playerWarrior = (runner?.grid && player) ? runner.grid.warriors.find(
    (w) => w.id.toLowerCase() === player.toLowerCase()
  ) : undefined

  if (!runner?.grid || !playerWarrior) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent p="6" bg="brand.background" maxW="1200px" minH="50vh">
          <Spinner />
        </ModalContent>
      </Modal>
    );
  }

  if (mutation.isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent p="6" bg="brand.background" maxW="1200px" minH="50vh">
          <Heading>Playing your card.</Heading>
          <Spinner />
        </ModalContent>
      </Modal>
    );
  }

  const inventory = Object.values(playerWarrior.inventory).filter((inventoryItem) => {
    return inventoryItem.quantity > 0
  }).map(
    (inventoryItem) => {
      const description = itemsByIdentifier[getIdentifier(inventoryItem.item)];
      if (!description) {
        console.error("missing item, ", inventoryItem);
        throw new Error("missing item");
      }

      const onClick = async () => {
        const item = {address: description.address, id: description.id}
        runner.ship('card-played', { player, item })
        try {
          await mutation.mutateAsync(item)
        } catch (err) {
          console.error('error submitting card: ', err)
        } finally {
          onClose()
        }
      }

      return (
        <Box
          bgColor="green"
          p="10"
          maxW="300px"
          borderRadius="10"
          key={`${description.identifier}`}
          onClick={onClick}
        >
          <VStack>
            <Image
              height="200px"
              width="200px"
              src={images[description.id]}
              objectFit="contain"
              alt={`card image for ${description.name}`}
            />
            <Heading size="lg">{description.name}</Heading>
            <Text textAlign="center">{description.description}</Text>
          </VStack>
        </Box>
      );
    }
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent p="6" bg="brand.background" maxW="1200px">
        <ModalBody backgroundImage={border} p="6">
          <Heading>Pick a card</Heading>
          <Stack direction={["column", "row"]} spacing="10">
            {inventory}
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PickCardModal;
