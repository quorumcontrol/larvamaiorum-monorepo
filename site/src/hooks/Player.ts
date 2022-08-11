import { useMemo } from "react";
import { useQuery } from "react-query";
import { useProvider } from "wagmi";
import { playerContract } from "../utils/contracts";

export const useUsername = (address?: string) => {
  const fetchIsInitialized = async () => {
    const name = await playerContract().name(address!);
    console.log('name for: ', address, name)
    return name
  };
  return useQuery(["player:username", address], fetchIsInitialized, {
    enabled: !!address
  });
};
