import { useQuery } from "react-query";
import { playerContract } from "../utils/contracts";
import { fetchQueryAppropriateMetadata } from "./BadgeOfAssembly";

export const useUsername = (address?: string) => {
  const fetchUsername = async () => {
    const name = await playerContract().name(address!);
    return name
  };
  return useQuery(["/player/username/", address], fetchUsername, {
    enabled: !!address
  });
};

export const useTeam = (address?: string) => {
  return useQuery(["/player/team/", address], async () => {
    const team = await playerContract().team(address!)
    if (team.eq(0)) {
      console.log('no team for ', address)
      return undefined
    }
    return fetchQueryAppropriateMetadata(team)
  }, {
    enabled: !!address
  });
}
