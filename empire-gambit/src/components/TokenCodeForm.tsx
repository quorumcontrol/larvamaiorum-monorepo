import { isLocalhost } from "@/utils/isLocalhost"
import { Box, Button, FormControl, FormErrorMessage, HStack, Input, Spinner, VStack } from "@chakra-ui/react"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import Router from "next/router"
import { useState } from "react"
import { useQueryClient } from "react-query"
import { useMutation, useSigner } from "wagmi"

const useTokenCode = () => {
  const queryClient = useQueryClient()
  const client = useSupabaseClient()
  const { data: signer } = useSigner()

  return useMutation(
    ["use-token-code"],
    async (code: string) => {
      const { data, error } = await client.functions.invoke("code-minter", {
        body: {
          code,
          chainId: isLocalhost() ? 31337 : 1032942172
        }
      })
      if (error) {
        console.error("error using token code", error)
        throw error
      }

      const { txHash } = data
      console.log("txHash", txHash, "provider", signer?.provider)

      await signer?.provider?.waitForTransaction(txHash)
    }, {
    onSuccess: () => {
      console.log("invalidating")
      queryClient.cancelQueries({ queryKey: ["token-balance"] })
      queryClient.invalidateQueries({ queryKey: ["token-balance"] })
    }
  })
}

const TokenCodeForm: React.FC = () => {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { mutateAsync } = useTokenCode()
  const client = useSupabaseClient()

  const onBuyTokenClick = async () => {
    setLoading(true)
    try {
      const { data, error } = await client.functions.invoke("create-stripe-session", {
        body: {
          successUrl: `${window.location.origin}/minerva`,
          cancelUrl: `${window.location.origin}/`,
          testOnly: isLocalhost(),
        }
      })
      if (error) {
        console.error("error doing stripe: ", error)
      }
      console.log("data", data)
      const { url } = data
      Router.push(url)
    } finally {
      setLoading(false)
    }

  }

  const onSubmit = async () => {
    setLoading(true)
    setError("")
    try {
      const resp = await mutateAsync(code)
      console.log("resp", resp)
      setCode("")
    } catch (err) {
      console.error("something went wrong", err)
      setError("There was a problem with that code")
    } finally {
      setLoading(false)
    }
  }

  return (
    <VStack spacing="8">
      <Button variant="primary" onClick={onBuyTokenClick}>Buy Tokens</Button>
      <HStack alignItems="top">
        <FormControl isInvalid={!!error} >
          <Input placeholder="Enter Token Code" name="code" minW="12em" value={code} onChange={(evt) => setCode(evt.target.value)} />
          <FormErrorMessage>{error}</FormErrorMessage>
        </FormControl>
        <FormControl>
          {loading && <Box><Spinner /></Box>}
          {!loading && <Button type="submit" variant="secondary" disabled={!loading} onClick={onSubmit}>Use Code</Button>}
        </FormControl>
      </HStack>
    </VStack>

  )
}

export default TokenCodeForm
