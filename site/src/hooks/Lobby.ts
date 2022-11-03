import { useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "react-query";
import { useAccount, useSigner } from "wagmi";
import { lobbyContract, playerContract } from "../utils/contracts";
import { useRelayer } from "./useUser";
import { addressToUid, db } from '../../src/utils/firebase'
import { doc, setDoc, serverTimestamp, onSnapshot } from "firebase/firestore"; 

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
    if (!address) {
      return;
    }
    const docRef = doc(db, `playerLocations/${addressToUid(address)}`)
    const unsub = onSnapshot(docRef, (doc) => {
      console.log("got a table id: ", doc, doc.data())
      const data = doc.data()
      if (!data ) {
        return
      }
      onTableStarted(data.table);
    })
    return () => {
      unsub()
    };
  }, [address, onTableStarted]);
};

// TODO: can we time this out on the client to set the "Hey I'm still here bit"
export const useRegisterInterest = () => {
  const queryClient = useQueryClient();

  return useMutation(async ({ addr }: { addr: string }) => {
    await setDoc(doc(db, "delphsLobby", addressToUid(addr)), {
      timestamp: serverTimestamp(),
    });
  }, {
    onError: (err, _newPlayer, context) => {
      console.error('error joinging: ', err)
      // queryClient.setQueryData(WAITING_PLAYERS_KEY, context ? context.previousPlayers : [])
    },
    onSettled: () => {
      queryClient.invalidateQueries(WAITING_PLAYERS_KEY, {
        refetchInactive: true,
      });
    }
  });
};
