import { DateTime } from "luxon"
import { useQuery } from "react-query"
import { wootgumpContract } from "../utils/contracts"
import { isTestnet } from "./useLore"

// export const DEPLOY_BLOCK = isTestnet ? {blockNumber: 2054801, timestamp: 1661858704 } : {blockNumber: 615268, timestamp: 1661762741}

export const EPOCH = DateTime.fromSQL('2022-09-07', { zone: 'utc+12'})

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
