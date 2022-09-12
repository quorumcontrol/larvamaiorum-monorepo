import { useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "react-query";
import { useAccount, useSigner } from "wagmi";
import { lobbyContract, playerContract } from "../utils/contracts";
import { useRelayer } from "./useUser";

const WAITING_PLAYERS_KEY = "waiting-players"

export const useWaitingPlayers = () => {
  const query = useQuery(
    WAITING_PLAYERS_KEY,
    async () => {
      const addrs = await lobbyContract().waitingAddresses();
      return Promise.all(
        addrs.map(async (addr) => {
          return { name: await playerContract().name(addr), addr };
        })
      );
    }
  );

  useEffect(() => {
    const handleEvt = () => {
      query.refetch();
      // queryClient.invalidateQueries('waiting-player', { refetchInactive: true })
    };
    const filter = lobbyContract().filters["RegisteredInterest(address)"](null);
    lobbyContract().on(filter, handleEvt);
    return () => {
      lobbyContract().off(filter, handleEvt);
    };
  }, [query]);

  return query;
};

export const useWaitForTable = (onTableStarted: (tableId?: string) => any) => {
  const { address } = useAccount();

  useEffect(() => {
    if (!address || !lobbyContract) {
      return;
    }
    const handle = (_: string, tableId: string, _evt: any) => {
      onTableStarted(tableId);
    };
    const filter = lobbyContract().filters.GameStarted(address, null);
    lobbyContract().on(filter, handle);
    return () => {
      lobbyContract().off(filter, handle);
    };
  }, [address, onTableStarted]);
};

export const useRegisterInterest = () => {
  const queryClient = useQueryClient();
  const { data:relayer } = useRelayer()

  return useMutation(async ({ addr }: { addr: string }) => {
    if (!relayer?.ready()) {
      throw new Error("the relayer must be ready to register interest");
    }
    const tx = await relayer.wrapped.lobby().registerInterest();
    await tx.wait()
    return {
      addr
    }
  }, {
    // onMutate: async (thisPlayer) => {
    //   await queryClient.cancelQueries(WAITING_PLAYERS_KEY)

    //   const previousPlayers = queryClient.getQueryData(WAITING_PLAYERS_KEY)
 
    //   // Optimistically update to the new value
    //   queryClient.setQueryData(WAITING_PLAYERS_KEY, (old:{addr:string}[]|undefined) => [...(old || []), thisPlayer])
  
    //   // Return a context object with the snapshotted value
    //   return { previousPlayers }
      
    // },
    onError: (err, _newPlayer, context) => {
      console.error('error joinging: ', err)
      queryClient.setQueryData(WAITING_PLAYERS_KEY, context ? context.previousPlayers : [])
    },
    onSettled: () => {
      queryClient.invalidateQueries(WAITING_PLAYERS_KEY, {
        refetchInactive: true,
      });
    }
  });
};
