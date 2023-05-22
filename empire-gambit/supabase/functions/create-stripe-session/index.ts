// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.15.0";
// Import via bare specifier thanks to the import_map.json file.
import Stripe from 'https://esm.sh/stripe@12.5.0'


const TEST_TOKEN = "price_1N9DFiJH583Xouw7qdQF3e67";
const PROD_TOKEN = "price_1N91X5JH583Xouw73adTKUkw";

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY') as string, {
  // This is needed to use the Fetch API rather than relying on the Node http
  // package.
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
})

serve(async (req) => {
  console.log("Hello from chat!");
  if (req.method === "OPTIONS") {
    console.log("OPTIONS", corsHeaders);
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    // Supabase API URL - env var exported by default.
    Deno.env.get("SUPABASE_URL") ?? "",
    // Supabase API ANON KEY - env var exported by default.
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    // Create client with Auth context of the user that called the function.
    // This way your row-level-security (RLS) policies are applied.
    {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    },
  );

  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (!user) {
    console.error("no user")
    return new Response("Not authorized", { status: 401 });
  }

  const { quantity } = await req.json()

  
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price: TEST_TOKEN,
        quantity: quantity || 5,
      },
    ],
    metadata: {
      user: user.id,
    },
    mode: "payment",
    success_url: `http://localhost:3000/api/success`,
    cancel_url: "http://localhost:3000/cancel",
  });

  console.log("session: ", session);

  if (!session.url) {
    throw new Error("no session");
  }

  return new Response(
    JSON.stringify({
      url: session.url
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  )
})
