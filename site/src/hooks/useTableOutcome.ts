import { useQuery } from "react-query"
import BoardRunner from "../utils/BoardRunner"

const useTableOutcome = (tableId?:string) => {
  return useQuery(
    ['/table-outcome', tableId],
    async () => {
      const boardRunner = new BoardRunner(tableId!)
      await boardRunner.run()
      return boardRunner.rewards()
    },
    {
      enabled: !!tableId,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  )
}

export default useTableOutcome
