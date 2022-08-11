import { useSigner } from "wagmi";
import { useCallback, useEffect, useState } from "react";
import relayer from "../utils/relayer";

export const useLogin = () => {
  const [isLoggedIn, setLoggedIn] = useState(relayer.ready())
  const [canCreateToken, setCanCreateToken] = useState(relayer.canCreateToken())
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const { data:signer } = useSigner();

  useEffect(() => {
    if (signer) {
      console.log('user signer has signer')
      relayer.setupForTokenCreation(signer)
    }
  }, [signer])

  useEffect(() => {
    if (relayer.canCreateToken()) {
      setCanCreateToken(true)
    }
    const readyForTokenHandler = () => {
      console.log('setting can create token to true')
      setCanCreateToken(true)
    }
    relayer.on('readyForTokenCreation', readyForTokenHandler)
    return () => {
      relayer.off('readyForTokenCreation', readyForTokenHandler)
    }
  }, [relayer, setCanCreateToken])

  const login = useCallback(async (username?:string) => {
    try{
      setIsLoggingIn(true)
      if (!canCreateToken) {
        console.error('login called too early')
        throw new Error('not ready to create token')
      }
      await relayer.createToken()
      if (username) {
        const tx = await relayer.wrapped.player().setUsername(username, { gasLimit: 500_000 })
        await tx.wait()
      }
      setLoggedIn(true)
    } catch(err) {
      console.error('error login', err)
      throw err
    } finally {
      setIsLoggingIn(false)
    }
  
  }, [canCreateToken, relayer, setIsLoggingIn, setLoggedIn]);

 
  return { relayer, isLoggingIn, isLoggedIn, login, readyToLogin: canCreateToken };
};

export interface UserData {
  username: string;
  email?: string;
}
