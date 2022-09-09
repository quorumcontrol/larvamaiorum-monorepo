import { Box, Button, Heading, VStack, Wrap, WrapItem } from "@chakra-ui/react";
import Link from "next/link";
import { useMemo } from "react";
import { SocialIcon } from "react-social-icons";
import { ACCOLADES_WITH_IMAGES } from "../utils/accoladesWithImages";
import AccoladeCard from "./AccoladeCard";

type Accolade = typeof ACCOLADES_WITH_IMAGES[0];

export interface GameWarrior {
  id: string;
  name: string;
  wootgumpBalance: number;
  attack: number;
  defense: number;
  currentHealth: number;
  initialHealth: number;
  firstGump: boolean;
  firstBlood: boolean;
  battlesWon: number;
}

const GameOverScreen: React.FC<{
  player?: string;
  warriors: GameWarrior[];
}> = ({ player, warriors }) => {
  const playersWarrior = warriors.find((w) => w.id === player);

  const accolades = useMemo(() => {
    let accolades: Accolade[] = [];
    if (!playersWarrior) {
      return accolades;
    }
    if (playersWarrior && warriors.slice(0, 3).includes(playersWarrior)) {
      accolades.push(
        ACCOLADES_WITH_IMAGES[warriors.slice(0, 3).indexOf(playersWarrior)]
      );
    }
    if (playersWarrior.firstGump) {
      accolades.push(ACCOLADES_WITH_IMAGES[3]);
    }
    if (playersWarrior.firstGump) {
      accolades.push(ACCOLADES_WITH_IMAGES[3]);
    }
    if (playersWarrior.firstGump) {
      accolades.push(ACCOLADES_WITH_IMAGES[3]);
    }
    if (playersWarrior.firstBlood) {
      accolades.push(ACCOLADES_WITH_IMAGES[4]);
    }
    if (playersWarrior.battlesWon > 0) {
      accolades.push(ACCOLADES_WITH_IMAGES[5]);
    }

    return accolades;
  }, [playersWarrior, warriors]);

  if (!playersWarrior) {
    return (
      <VStack>
        <Heading>Game Over.</Heading>
      </VStack>
    );
  }

  const intent = encodeURIComponent(
    `I just harvested ${playersWarrior.wootgumpBalance} wootgump playing Delph's Table for a chance to win 115k $SKL in prizes! https://cryptocolosseum.com/`
  )

  return (
    <VStack spacing="4">
      <Heading>
        You harvested{" "}
        <Box as="span" color="brand.orange">
          {playersWarrior.wootgumpBalance} Wootgump
        </Box>
      </Heading>
      {accolades.length > 0 && (
        <>
          <Heading size="lg">and received:</Heading>
          <Wrap spacing="10">
            {accolades?.map((accolade) => {
              return (
                <WrapItem key={`game-over-accolade-${accolade.id}`}>
                  <AccoladeCard tokenId={accolade.id} address={player} hideCount />
                </WrapItem>
              );
            })}
          </Wrap>
        </>
      )}
      <Link href="/delphs-table/play">
        <Button variant="primary">Play Again</Button>
      </Link>
      <Heading size="lg">Share your progress with your friends.</Heading>
        
      <SocialIcon url={`https://twitter.com/intent/tweet?text=${intent}`} />
    </VStack>
  );
};

export default GameOverScreen;
