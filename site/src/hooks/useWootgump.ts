import { DateTime } from "luxon"
import { useQuery } from "react-query"
import { delphsGumpContract, wootgumpContract } from "../utils/contracts"

export const EPOCH = DateTime.fromSQL('2022-09-07', { zone: 'utc-12' })

export const useWootgumpBalance = (address?: string) => {
  return useQuery(
    ["/wootgump-balance", address],
    async () => {
      const wootgump = wootgumpContract()
      return wootgump.balanceOf(address!)
    },
    {
      enabled: !!address
    }
  )
}

export const useDelphsGumpBalance = (address?: string) => {
  return useQuery(
    ["/delphs-gump-balance", address],
    async () => {
      const dGump = delphsGumpContract()
      return dGump.balanceOf(address!)
    },
    {
      enabled: !!address
    }
  )
}
