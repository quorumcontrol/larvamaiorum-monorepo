// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.15.0";
import { contract, syncer } from "../_shared/tokenContract.ts";
import { safeAddress } from "https://esm.sh/@skaleboarder/safe-tools@0.0.24";
import { utils } from "https://esm.sh/ethers@5.7.2";
import { getServiceClient } from "../_shared/serviceClient.ts";

serve(async (req) => {
  console.log("Hello from streaming start-chat!");
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

  if (!user || !user.email) {
    console.error("no user");
    return new Response("Not authorized", { status: 401 });
  }

  const serviceClient = getServiceClient();

  const { data, error } = await serviceClient.from("free_readings").select("*")
    .eq("user_id", user.id).eq("day_of_play", new Date().toUTCString()).maybeSingle();

  if (error) {
    console.error("error getting free readings", error);
    throw error;
  }

  if (!data || data.amount === 0) {
    console.log("incrementing free readings")
    await serviceClient.rpc("increment_free_reading", { p_user_id: user.id });
    return new Response(
      JSON.stringify({
        ok: true,
        free: true,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }

  const { chainId } = await req.json();

  const token = contract(chainId);

  const userAddress = user.email.split("@")[0];
  const safe = await safeAddress(userAddress, chainId);

  const tx = await syncer.push(async () => {
    console.log("adminBurn", safe);
    return await token.adminBurn(safe, utils.parseEther("1"), {
      gasLimit: 1_000_000,
    });
  });

  return new Response(
    JSON.stringify({
      ok: true,
      tx: tx.hash,
      free: false,
    }),
    {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    },
  );
});
