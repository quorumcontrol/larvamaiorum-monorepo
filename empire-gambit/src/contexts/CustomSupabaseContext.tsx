import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs"
import { useEffect, useState } from "react"
import { useAccount, useSigner } from "wagmi"
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { SafeSigner } from "@skaleboarder/safe-tools"

// TODO: wrap the jwt stuff into a useQuery so that it does retries, refreshes, etc.

const CustomSupabaseContext:React.FC<{children:React.ReactNode, pageProps:any}> = ({children, pageProps}) => {
  const [supabase] = useState(() => createBrowserSupabaseClient())
  const { isConnected } = useAccount()
  const { data:signer } = useSigner()

  useEffect(() => {
    if (!signer || !isConnected) {
      return
    }

    const doAsync = async () => {
      console.log("waiting for user's proof")
      const proof = await (signer as SafeSigner).proofOfRelayer()
      console.log("getting new supabase email, password confirmation based on signature")
  
      // using a fresh client here to avoid looping the useEffect
      const resp = await supabase.functions.invoke("app-auth", { 
        body: {
          proof: proof,
        }
      })
      
      const { email, password } = resp.data
      if (!email || !password) {
        console.error("no email or password")
        throw new Error('no credentials')
      } else {
        console.log("received email", email)
      }
      await supabase.auth.signInWithPassword({ email, password })
    }

    doAsync()
   
  }, [signer, isConnected, supabase])

  return (
    <SessionContextProvider supabaseClient={supabase} initialSession={pageProps.initialSession}>
      {children}
    </SessionContextProvider>
  )
}

export default CustomSupabaseContext