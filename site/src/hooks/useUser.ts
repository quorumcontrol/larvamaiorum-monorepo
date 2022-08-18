import { useAccount, useSigner } from "wagmi";
import { useQuery } from 'react-query';
import { useCallback, useEffect, useState } from "react";
import RelayManager from "../utils/relayer";

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

  const login = useCallback(async (username?: string) => {
    try {
      setIsLoggingIn(true)
      if (!canCreateToken || !relayer) {
        console.error('login called too early')
        throw new Error('not ready to create token')
      }
      await relayer.createToken()
      if (username) {
        const tx = await relayer.wrapped.player().setUsername(username, { gasLimit: 500_000 })
        console.log("tx: ", tx.hash)
        await tx.wait()
      }
      setLoggedIn(true)
    } catch (err) {
      console.error('error login', err)
      throw err
    } finally {
      setIsLoggingIn(false)
    }

  }, [canCreateToken, setIsLoggingIn, setLoggedIn, relayer]);


  return { relayer, isLoggingIn, isLoggedIn, login, readyToLogin: canCreateToken };
};

export interface UserData {
  username: string;
  email?: string;
}
