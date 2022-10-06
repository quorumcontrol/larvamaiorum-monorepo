import { useMutation, useQuery } from "react-query";
import { delphsContract } from "../utils/contracts";
import { useRelayer } from "./useUser";

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

export const usePlayCardMutation = (tableId?:string) => {
  const { data: relayer } = useRelayer();

  return useMutation(async ({address, id}:{address:string, id:number}) => {
    if (!tableId) {
      throw new Error('need to have a tableId')
    }
    if (!relayer || !relayer.ready()) {
      throw new Error('relayer is not ready')
    }
    const delphsTable = relayer.wrapped.delphsTable()
    const tx = await delphsTable.playItem(tableId, address, id)
    return tx.wait()
  })
}