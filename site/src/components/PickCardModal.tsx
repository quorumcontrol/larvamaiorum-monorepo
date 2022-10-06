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
import { useMemo } from "react";

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

  const playerWarrior = useMemo(() => {
    if (!runner?.grid || !player) {
      return
    }
    return runner.grid.warriors.find(
      (w) => w.id.toLowerCase() === player.toLowerCase()
    );
  }, [runner?.grid, player]);

  if (!runner?.grid || !playerWarrior || mutation.isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent p="6" bg="brand.background" maxW="1200px">
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
        await mutation.mutateAsync({address: description.address, id: description.id})
        onClose()
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
