import {
  Box,
  Button,
  Heading,
  Link,
  Spinner,
  VStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useMemo } from "react";
import { SocialIcon } from "react-social-icons";
import { InventoryItem } from "../boardLogic/items";
import { GameRunner } from "../hooks/gameRunner";
import { ACCOLADES_WITH_IMAGES } from "../utils/accoladesWithImages";
import AccoladeCard from "./AccoladeCard";

type Accolade = typeof ACCOLADES_WITH_IMAGES[0];

export interface GameWarrior {
  id: string;
  name: string;
  wootgumpBalance: number;
  initialGump: number;
  attack: number;
  defense: number;
  currentHealth: number;
  initialHealth: number;
  firstGump: boolean;
  firstBlood: boolean;
  battlesWon: number;
  item?: InventoryItem
}

const GameOverScreen: React.FC<{
  player?: string;
  runner?: GameRunner;
}> = ({ player, runner }) => {
  const rewards = useMemo(() => {
    if (!runner || !runner.grid) {
      return undefined;
    }
    return runner.grid.rewards();
  }, [runner]);

  const accolades = useMemo(() => {
    let accolades: Accolade[] = [];

    if (!rewards || !player) {
      return accolades;
    }
    const playersWarrior = rewards.ranked.find((w) => w.id === player);
    if (!playersWarrior) {
      return accolades;
    }

    if (rewards.ranked.slice(0, 3).includes(playersWarrior)) {
      accolades.push(
        ACCOLADES_WITH_IMAGES[
          rewards.ranked.slice(0, 3).indexOf(playersWarrior)
        ]
      );
    }
    if (rewards.quests.firstGump === playersWarrior) {
      accolades.push(ACCOLADES_WITH_IMAGES[3]);
    }
    if (rewards.quests.firstBlood === playersWarrior) {
      accolades.push(ACCOLADES_WITH_IMAGES[4]);
    }
    if ((rewards.quests.battlesWon[playersWarrior.id] || 0) > 0) {
      accolades.push(ACCOLADES_WITH_IMAGES[5]);
    }

    return accolades;
  }, [rewards, player]);

  if (!rewards) {
    return (
      <VStack>
        <Heading>Game Over.</Heading>
        <Spinner />
      </VStack>
    );
  }

  if (rewards && !rewards.ranked.some((w) => w.id === player)) {
    return (
      <VStack>
        <Heading>Game Over.</Heading>
      </VStack>
    );
  }

  const intent = encodeURIComponent(
    `I just harvested ${
      rewards.wootgump[player!]
    } wootgump playing Delph's Table! $SKL prizes here I come. https://cryptocolosseum.com/`
  );

  return (
    <VStack spacing="4">
      <Heading>
        You harvested{" "}
        <Box as="span" color="brand.orange">
          {rewards.wootgump[player!]} Delph&apos;s Gump.
        </Box>
      </Heading>
      {accolades.length > 0 && (
        <>
          <Heading size="lg">and received:</Heading>
          <Wrap spacing="10">
            {accolades?.map((accolade) => {
              return (
                <WrapItem key={`game-over-accolade-${accolade.id}`}>
                  <AccoladeCard
                    tokenId={accolade.id}
                    address={player}
                    hideCount
                  />
                </WrapItem>
              );
            })}
          </Wrap>
        </>
      )}
      <NextLink href="/delphs-table/play/cleanSlate" passHref>
        <Link>
          <Button variant="primary">Play Again</Button>
        </Link>
      </NextLink>
      <Heading size="lg">Share your progress with your friends.</Heading>

      <SocialIcon url={`https://twitter.com/intent/tweet?text=${intent}`} target="_blank" />
    </VStack>
  );
};

export default GameOverScreen;
