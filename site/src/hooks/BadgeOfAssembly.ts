import { BigNumber, BigNumberish } from "ethers"
import { useQuery } from "react-query"
import { BadgeOfAssembly } from "../../badge-of-assembly-types"
import ThenArg from "../utils/ThenArg"
import { badgeOfAssemblyContract } from "../utils/contracts"

export const fetchQueryAppropriateMetadata = async (tokenId: BigNumberish) => {
  const metadata = await badgeOfAssemblyContract().metadata(tokenId)
  return {
    ...metadata,
    id: BigNumber.from(tokenId),
  }
}

export const useUserBadges = (address?: string) => {
  const badgeOfAssembly = badgeOfAssemblyContract()
  const fetchUserTokens = async () => {
    const userTokenIds = await badgeOfAssembly.userTokens(address!)
    console.log('user tokens: ', userTokenIds, address)
    return Promise.all(userTokenIds.map(fetchQueryAppropriateMetadata))
  }
  return useQuery(['user-tokens', address], fetchUserTokens, {
    enabled: !!address
  })
}

export const useBadgeMetadata = (tokenId?: BigNumberish) => {
  return useQuery(
    ['badge-metadata', tokenId],
    () => {
      return fetchQueryAppropriateMetadata(tokenId!)
    }, {
    enabled: !!tokenId
  })
}

export type MetadataWithId = ThenArg<ReturnType<BadgeOfAssembly['metadata']>> & { id: BigNumber }
