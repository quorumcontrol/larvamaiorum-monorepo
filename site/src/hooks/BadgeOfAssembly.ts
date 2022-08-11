import { BigNumber } from "ethers"
import { useInfiniteQuery, useQuery } from "react-query"
import { BadgeOfAssembly } from "../../badge-of-assembly-types"
import ThenArg from "../utils/ThenArg"
import { badgeOfAssemblyContract } from "../utils/contracts"

export const useUserBadges = (address?:string) => {
  const badgeOfAssembly = badgeOfAssemblyContract()
  const fetchUserTokens = async () => {
    const userTokenIds = await badgeOfAssembly.userTokens(address!)
    console.log('user tokens: ', userTokenIds, address)
    return Promise.all(userTokenIds.map(async (tokenId) => {
      const metadata = await badgeOfAssembly.metadata(tokenId)
      return {
        ...metadata,
        id: tokenId,
      }
    }))
  }
  return useQuery(['user-tokens', address], fetchUserTokens, {
    enabled: !!address
  })
}

export type MetadataWithId = ThenArg<ReturnType<BadgeOfAssembly['metadata']>> & { id: BigNumber }

const PAGE_SIZE = 50
export const useAllTokens = () => {
  const badgeOfAssembly = badgeOfAssemblyContract()

  async function fetchTokenMetadata({ pageParam = 1 }) {
    const metadata = await Promise.all(Array(PAGE_SIZE).fill(true).map((_, i) => {
      return badgeOfAssembly.metadata(pageParam + i)
    }))
    const isMetadataBlank = (meta: typeof metadata[0]) => {
      return meta.name === ''
    }
    const isFinished = metadata.some(isMetadataBlank)
    console.log("use all tokens, isFinished: ", isFinished)
    const filteredMetas = metadata.map((meta, i) => {
      return {...meta, id: BigNumber.from(pageParam + i) }
    }).filter((meta) => !isMetadataBlank(meta))
    return {
      start: pageParam,
      length: filteredMetas.length,
      metadata: filteredMetas,
      isFinished
    }
  }

  return useInfiniteQuery('allTokens', fetchTokenMetadata, {
    getNextPageParam: (lastPage) => {
      if (lastPage.isFinished) {
        return undefined
      }
      return lastPage.start + lastPage.length
    }
  } )

}