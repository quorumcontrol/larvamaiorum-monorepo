// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Import via bare specifier thanks to the import_map.json file.
import Stripe from 'https://esm.sh/stripe@12.5.0'
import { getServiceClient } from "../_shared/serviceClient.ts"
import { contract, syncer } from "../_shared/tokenContract.ts"
import {utils} from "https://esm.sh/ethers@5.7.2"
import { safeAddress } from "https://esm.sh/@skaleboarder/safe-tools@0.0.24"

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY') as string, {
  // This is needed to use the Fetch API rather than relying on the Node http
  // package.
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
})
// This is needed in order to use the Web Crypto API in Deno.
const cryptoProvider = Stripe.createSubtleCryptoProvider()

console.log('Hello from Stripe Webhook!')

serve(async (request) => {
  const chainId = parseInt(Deno.env.get('CHAIN_ID') || "", 10)
  if (chainId === 0) {
    throw new Error("missing chainId")
  }

  const signature = request.headers.get('Stripe-Signature')

  const serviceClient = getServiceClient()

  // First step is to verify the event. The .text() method must be used as the
  // verification relies on the raw request body rather than the parsed JSON.
  const body = await request.text()
  let receivedEvent
  try {
    receivedEvent = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET')!,
      undefined,
      cryptoProvider
    )
  } catch (err) {
    console.error("error verifying stripe:", err)
    return new Response(err.message, { status: 400 })
  }
  console.log(`🔔 Event received:`, receivedEvent.id, receivedEvent.object)

  if (receivedEvent.type === "checkout.session.completed") {
    console.log("successful payment")
    const { data:{ user }, error } = await serviceClient.auth.admin.getUserById(receivedEvent.data.object.metadata.user)
    if (error) {
      console.error("error getting user: ", error)
      return new Response(JSON.stringify({ ok: false }), { status: 400 })
    }
    console.log("user: ", user)

    const amount = receivedEvent.data.object.amount_subtotal / 25
    console.log("number of tokens: ", amount, typeof amount)

    const userAddress = user!.email!.split("@")[0];
    const safe = await safeAddress(userAddress, chainId);

    const tokens = contract(chainId)
    const tx = await syncer.push(async () => {
      return await tokens.mint(safe, utils.parseEther(amount.toString()))
    })

    console.log("tx: ", tx.hash)
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 })
})
