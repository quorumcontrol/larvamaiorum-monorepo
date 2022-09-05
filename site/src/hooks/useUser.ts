import { useAccount, useSigner } from "wagmi";
import { useQuery, useQueryClient } from 'react-query';
import { useCallback, useEffect, useState } from "react";
import RelayManager from "../utils/relayer";
import { BigNumberish } from "ethers";
import { playerContract } from "../utils/contracts";

export const useRelayer = () => {
  const { data:signer } = useSigner()
  const { address } = useAccount()

  return useQuery(['/relayer/', address], () => {
    console.log('fetching relayer for', signer)
    return new RelayManager(signer!)
  }, {
    enabled: !!signer && !!address,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  })
}

export const useLogin = () => {
  const { data: signer } = useSigner();
  const { data: relayer } = useRelayer()
  const [isLoggedIn, setLoggedIn] = useState(signer && relayer?.ready())
  const [canCreateToken, setCanCreateToken] = useState(relayer?.canCreateToken())
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!relayer) {
      return
    }
    const doAsync = async () => {
      await relayer.waitForReady()
      setCanCreateToken(true)
    }

    doAsync()

  }, [relayer, setCanCreateToken])

  const login = useCallback(async (username?: string, team?:BigNumberish) => {
    try {
      setIsLoggingIn(true)
      if (!canCreateToken || !relayer) {
        console.error('login called too early')
        throw new Error('not ready to create token')
      }
      await relayer.createToken()
      if (username) {
        console.log('setting username, team to: ', username, team)
        if (team) {
          const userNameSet = await playerContract().populateTransaction.setUsername(username)
          const teamSet = await playerContract().populateTransaction.setTeam(team)
          const tx = await relayer.multisend([userNameSet, teamSet])
          console.log("tx: ", tx.hash)
          await tx.wait()
        } else {
          const tx = await relayer.wrapped.player().setUsername(username)
          console.log("tx: ", tx.hash)
          await tx.wait()
        }
      }
      setLoggedIn(true)
    } catch (err) {
      console.error('error login', err)
      throw err
    } finally {
      setIsLoggingIn(false)
      const addr = await signer?.getAddress()
      queryClient.invalidateQueries(["/player/username/", addr], { refetchInactive: true })
      queryClient.invalidateQueries(["/player/team/", addr], { refetchInactive: true })
    }

  }, [canCreateToken, setIsLoggingIn, setLoggedIn, relayer, signer, queryClient]);


  return { relayer, isLoggingIn, isLoggedIn, login, readyToLogin: canCreateToken };
};

export interface UserData {
  username: string;
  email?: string;
}
