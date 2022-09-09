import { Spinner, Wrap, WrapItem } from "@chakra-ui/react";
import { usePlayerAccolades } from "../hooks/useAccolades";
import AccoladeCard from "./AccoladeCard";

const AccoladesDisplay: React.FC<{ address?: string }> = ({ address }) => {
  const { data: playerAccolades, isLoading } = usePlayerAccolades(address);

  return (
    <Wrap spacing="10">
      {isLoading && <Spinner />}
      {playerAccolades?.map((id, i) => {
        return (
          <WrapItem key={`nftcard-${id}`}>
            <AccoladeCard tokenId={id.toNumber()} address={address} />
          </WrapItem>
        );
      })}
    </Wrap>
  );
};

export default AccoladesDisplay;
