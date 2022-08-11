import { useQuery } from "react-query";
import { delphsContract } from "../utils/contracts";

export const useTableMetadata = (tableId:string) => {

  return useQuery(['table-metadata', tableId], async () => {
    const delphsTable = delphsContract()

    const [meta, latestRoll] = await Promise.all([
      delphsTable.tables(tableId),
      delphsTable.latestRoll()
    ])
    return {
      startedAt: meta.startedAt,
      length: meta.gameLength,
      end: meta.startedAt.add(meta.gameLength),
      latestRoll,
    }
  })
}