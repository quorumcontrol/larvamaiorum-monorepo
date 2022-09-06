import { BigNumberish } from "ethers"
import { useQuery } from "react-query"
import { accoladesContract } from "../utils/contracts"

export const usePlayerAccolades = (address?:string) => {
  return useQuery(
    ['/player-accolades', address],
    async () => {
      return accoladesContract().userTokens(address!)
    }, {
      enabled: !!address
    }
  )
}

export const useAccoladesBalance = (tokenId:BigNumberish, address?:string) => {
  return useQuery(
    ['/accolades-balance', address, tokenId.toString()],
    async () => {
      return accoladesContract().balanceOf(address!, tokenId)
    }, {
      enabled: !!address
    }
  )
}
