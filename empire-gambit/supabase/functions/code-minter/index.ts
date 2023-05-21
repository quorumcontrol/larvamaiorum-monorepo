// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.15.0";
import { getServiceClient } from "../_shared/serviceClient.ts";
import { ethers, providers, utils } from "https://esm.sh/ethers@5.7.2";
import { safeAddress } from "https://esm.sh/@skaleboarder/safe-tools@0.0.24"
import SimpleSyncher from "../_shared/SimpleSyncher.ts";

const tokenAddress = "0xEeeefF87F0eCfF90dF0AdE8133dA0b20eA69f4e8";

const syncer = new SimpleSyncher();

const rpcs: Record<number, { rpc: string; address?: string }> = {
  1032942172: {
    rpc: "https://mainnet.skalenodes.com/v1/haunting-devoted-deneb",
  },
  31337: {
    rpc: "http://host.docker.internal:8545",
  },
};

serve(async (req) => {
  console.log("Hello from code-minter!");
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

  const serviceClient = getServiceClient();

  if (!user || !user.email) {
    console.error("no user from blockchain");
    return new Response("Not authorized", { status: 401 });
  }

  const { code: codeString, chainId } = await req.json();

  const provider = new providers.StaticJsonRpcProvider(rpcs[chainId].rpc);
  const signer = new ethers.Wallet(Deno.env.get("TOKEN_MINTER_PK")!).connect(
    provider,
  );
  // const token = EmpireGambitToken__factory.connect(signer, tokenAddress);

  const token = new ethers.Contract(
    tokenAddress,
    [
      "function mint(address to, uint256 value)",
    ],
    signer,
  );

  const userAddress = user.email.split("@")[0];
  const safe = await safeAddress(userAddress, chainId);

  const { data, error } = await serviceClient.from("token_promo_codes").select(
    "*",
  ).eq("code", codeString).single();
  if (error) {
    console.error("error getting token: ", error);
    return new Response("Error", { headers: corsHeaders, status: 500 });
  }

  console.log("found code", data)

  // await serviceClient.from("token_promo_codes").delete().eq("code", codeString);

  const { amount } = data;

  if(!amount) {
    throw new Error('missing amount from code')
  }

  const tx = await syncer.push(async () => {
    console.log("minting", amount, "to", safe)
    const tx = await token.mint(safe, utils.parseEther(amount.toString()), { gasLimit: 1_000_000 });
    return tx;
  });

  console.log("tx", tx.hash)

  return new Response(
    JSON.stringify({
      txHash: tx.hash,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
