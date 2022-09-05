import { useQuery } from "react-query"
import { wootgumpContract } from "../utils/contracts"

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
