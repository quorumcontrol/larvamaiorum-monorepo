import { useProvider, useAccount } from "wagmi"
import { PlayerProfile, PlayerProfile__factory } from "../contract-types"
import { useQuery } from "react-query"
import { useDeploys } from "@/contexts/deploys"
import { useSafeFromUser } from "./useSafe"
import { constants } from "ethers"

interface User {
  profile?: PlayerProfile.MetadataStructOutput
  address: string
  safeAddress: string
}

const usePlayerProfile = () => {
  const provider = useProvider()
  const { PlayerProfile: { address: playerProfileContractAddress } } = useDeploys()

  return PlayerProfile__factory.connect(playerProfileContractAddress, provider)
}

export const useUser = () => {
  const { address } = useAccount()
  const { data: safeAddr } = useSafeFromUser()
  const playerProfile = usePlayerProfile()

  return useQuery(
    "profile",
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
        console.log("tokens: ", tokens)
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
      enabled: !!safeAddr && !!address,
    }
  )
}   
