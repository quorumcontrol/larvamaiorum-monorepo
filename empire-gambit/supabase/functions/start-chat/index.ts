// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.15.0";
import { contract, syncer } from "../_shared/tokenContract.ts";
import { safeAddress } from "https://esm.sh/@skaleboarder/safe-tools@0.0.24";
import { utils } from "https://esm.sh/ethers@5.7.2";

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

  const { chainId } = await req.json();
  console.log("received chainId: ", chainId);

  const token = contract(chainId);

  const userAddress = user.email.split("@")[0];
  const safe = await safeAddress(userAddress, chainId);

  const tx = await syncer.push(async () => {
    console.log("adminBurn", safe);
    const tx = await token.adminBurn(safe, utils.parseEther("1"), {
      gasLimit: 1_000_000,
    });
    return tx;
  });

  return new Response(
    JSON.stringify({
      tx: tx.hash,
    }),
    {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
      },
    },
  );
});
