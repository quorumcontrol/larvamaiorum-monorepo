import { useProvider, useAccount, useSigner } from "wagmi"
import { PlayerProfile, PlayerProfile__factory } from "../contract-types"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { useDeploys } from "@/contexts/deploys"
import { useSafeFromUser } from "./useSafe"
import { constants, Signer } from "ethers"

const PROFILE_QUERY_KEY = "profile"

interface User {
  profile?: PlayerProfile.MetadataStructOutput
  address: string
  safeAddress: string
}

const usePlayerProfile = (signer?: Signer | null) => {
  const provider = useProvider()
  const { PlayerProfile: { address: playerProfileContractAddress } } = useDeploys()

  return PlayerProfile__factory.connect(playerProfileContractAddress, signer || provider)
}

export const useMintProfile = () => {
  const queryClient = useQueryClient()
  const { address } = useAccount()

  const { data: signer } = useSigner()
  // make sure the use has a safe
  const { data: safeAddr } = useSafeFromUser()
  const playerProfile = usePlayerProfile(signer)

  return useMutation(async (metadata: PlayerProfile.MetadataStruct) => {
    if (!safeAddr) {
      console.error("user does not yet have a safe", safeAddr, signer)
      throw new Error("user does not yet have a safe")
    }
    const tx = await playerProfile.safeMint(metadata)
    console.log("minting profile", tx.hash)
    await tx.wait()
    return metadata
  }, {
    onMutate: async (metadata) => {
      await queryClient.cancelQueries([PROFILE_QUERY_KEY, address])
      const previousProfile = queryClient.getQueryData([PROFILE_QUERY_KEY, address])
      
      queryClient.setQueryData([PROFILE_QUERY_KEY, address], {
        address,
        safeAddress: safeAddr!,
        profile: metadata,
      })

      return { previousProfile, metadata }
    },
    onSettled: (metadata, error, _vars, context) => {
      queryClient.cancelQueries([PROFILE_QUERY_KEY, address])
      if (error) {
        console.error("error minting profile", error, metadata, context)
        queryClient.setQueryData([PROFILE_QUERY_KEY, address], context?.previousProfile)
        return
      }
      
      // we *might* want to invalidate the query here or do so with a timeout maybe?
    },
  })
}

export const useUser = () => {
  const { address, isConnected } = useAccount()
  const { data: safeAddr } = useSafeFromUser()
  const playerProfile = usePlayerProfile()

  return useQuery(
    [PROFILE_QUERY_KEY, address],
    async (): Promise<User> => {
      try {
        if (safeAddr === constants.AddressZero) {
          return {
            address: address!,
            safeAddress: safeAddr,
          }
        }
        if (!safeAddr) {
          throw new Error("no safe address")
        }

        const tokens = await playerProfile.balanceOf(safeAddr)
        if (tokens.isZero()) {
          return {
            address: address!,
            safeAddress: safeAddr,
          }
        }
        const id = await playerProfile.tokenOfOwnerByIndex(safeAddr, 0)
        const profile = await playerProfile.metadata(id)
        return {
          address: address!,
          safeAddress: safeAddr,
          profile,
        }
      } catch (err) {
        console.error("error fetching user", err, safeAddr, address)
        throw err
      }
    },
    {
      enabled: !!safeAddr && !!address && isConnected,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  )
}   
