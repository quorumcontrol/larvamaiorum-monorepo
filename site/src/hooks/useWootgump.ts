import { DateTime } from "luxon"
import { useQuery } from "react-query"
import { wootgumpContract } from "../utils/contracts"
import { isTestnet } from "./useLore"

export const EPOCH = DateTime.fromSQL('2022-09-07', { zone: 'utc-12'})

export const useWootgumpBalance = (address?:string) => {
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
