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
import berserkSrc from "../../assets/images/cards/berserk.png";
import thieveSrc from "../../assets/images/cards/thieve.png";
import { GameRunner } from "../hooks/gameRunner";
import {
  getIdentifier,
  itemsByIdentifier,
  ItemDescription,
} from "../boardLogic/items";
import { usePlayCardMutation } from "../hooks/useDelphsTable";
import { useState } from "react";

const maxW = "900px";

const images: Record<number, StaticImageData> = {
  2: berserkSrc,
  3: thieveSrc,
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
  const [playedCard, setPlayedCard] = useState<undefined | ItemDescription>();

  const mutation = usePlayCardMutation(runner?.tableId);

  const playerWarrior =
    runner?.grid && player
      ? runner.grid.warriors.find(
          (w) => w.id.toLowerCase() === player.toLowerCase()
        )
      : undefined;

  if (!runner?.grid || !playerWarrior) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent p="6" bg="brand.background" maxW={maxW} minH="50vh">
          <ModalBody backgroundImage={border} p="10">
            <Spinner />
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  if (playedCard) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent p="4" bg="brand.background" maxW={maxW} minH="50vh">
          <ModalBody backgroundImage={border} p="10">
            <VStack spacing="4">
              <Heading>Playing your card.</Heading>
              <Box>
                <Image
                  height="200px"
                  width="200px"
                  src={images[playedCard.id]}
                  objectFit="contain"
                  alt={`card image for ${playedCard.name}`}
                />
              </Box>
              <Text textAlign="center" maxW="50%">{playedCard.description}</Text>
              <Spinner />
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  const inventory = Object.values(playerWarrior.inventory)
    .filter((inventoryItem) => {
      return inventoryItem.quantity > 0;
    })
    .map((inventoryItem) => {
      const description = itemsByIdentifier[getIdentifier(inventoryItem.item)];
      if (!description) {
        console.error("missing item, ", inventoryItem);
        throw new Error("missing item");
      }

      const onClick = async () => {
        setPlayedCard(description!);
        const item = { address: description.address, id: description.id };
        runner.ship("card-played", { player, item });
        try {
          await mutation.mutateAsync(item);
        } catch (err) {
          console.error("error submitting card: ", err);
        } finally {
          setPlayedCard(undefined);
          onClose();
        }
      };

      return (
        <Box
          p="0"
          maxW="300px"
          borderRadius="10"
          key={`${description.identifier}`}
          onClick={onClick}
        >
          <VStack spacing="4">
            <Image
              height="600px"
              width="400px"
              src={images[description.id]}
              objectFit="contain"
              alt={`card image for ${description.name}`}
            />
            <Text pl="2">{description.description}</Text>
          </VStack>
        </Box>
      );
    });

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent p="4" bg="brand.background" maxW={maxW}>
        <ModalBody backgroundImage={border} p="10">
          <Heading>Pick a card</Heading>
          <Stack direction={["column", "row"]} spacing="12">
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
