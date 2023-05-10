// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.15.0";
import { cards } from "../_shared/tarot.ts"
import { randomInt } from "../_shared/randomNumber.ts";
import { imageFromPrompt } from "../_shared/image.ts";
import { base64ToBytes } from "https://deno.land/std@0.177.0/node/internal_binding/_utils.ts";

serve(async (req) => {
  console.log("Hello from card!");
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

  const supabaseServiceClient = createClient(
    // Supabase API URL - env var exported by default.
    Deno.env.get("SUPABASE_URL") ?? "",
    // Supabase API ANON KEY - env var exported by default.
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (!user) {
    console.error("no user")
    return new Response("Not authorized", { status: 401 });
  }

  const card = cards[randomInt(cards.length)];

  const image = await imageFromPrompt(
    `The tarot card: ${card}`
  )
  const bytes = base64ToBytes(image.base64)
  const storeResponse = await supabaseServiceClient.storage.from("images").upload(`user-${user.id}/${crypto.randomUUID()}.png`, bytes, { contentType: "image/png"})

  if (!storeResponse.data?.path) {
    throw new Error(storeResponse.error?.message ?? "Unknown error storing image.")
  }

  return new Response(
    JSON.stringify({
      card,
      image: storeResponse.data.path,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  )
})
