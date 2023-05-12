// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getServiceClient } from "../_shared/serviceClient.ts";
import { corsHeaders } from "../_shared/cors.ts";
import * as postgres from "https://deno.land/x/postgres@v0.14.2/mod.ts";
import { ethers, providers } from "https://esm.sh/ethers@5.7.2";
import { WalletDeployer__factory, GnosisSafe__factory } from "https://esm.sh/@skaleboarder/safe-tools@0.0.10"

const walletDeployerAddress = "0xda8c9400c2e4656E7B0AaaC213e482bb8fA3248E"

const deploys:Record<number, {rpc: string, address?:string}> = {
  1032942172: {
    rpc: "https://mainnet.skalenodes.com/v1/haunting-devoted-deneb",
    // address: "0x7F425D92f24806450f1673CafDaDfFa20f9F3f10",
  },
  31337: {
    rpc: 'http://host.docker.internal:8545',
    // address: "0x7F425D92f24806450f1673CafDaDfFa20f9F3f10"
  },
}

// Get the connection string from the environment variable "SUPABASE_DB_URL"
const databaseUrl = Deno.env.get("SUPABASE_DB_URL")!;

// Create a database pool with three connections that are lazily established
const pool = new postgres.Pool(databaseUrl, 3, true);

serve(async (req) => {
  console.log("hello auth");

  console.log("Hello from app-auth!");
  if (req.method === "OPTIONS") {
    console.log("OPTIONS", corsHeaders);
    return new Response("ok", { headers: corsHeaders });
  }

  const { proofJson, signature }: {proofJson: string, signature:string } = await req.json();


  const proof:{
    address: string,
    chainId: number,
    exp: number
  } = JSON.parse(proofJson);

  console.log("proof: ", proof, signature)


  // TODO: check exp

  const deploy = deploys[proof.chainId];
  if (!deploy) {
    return new Response("Invalid chain Id", { headers: corsHeaders, status: 400 });
  }

  const device = ethers.utils.verifyMessage(proofJson, signature)

  const provider = new providers.StaticJsonRpcProvider(deploy.rpc)

  console.log("block: ", provider.blockNumber)

  const walletFactory = WalletDeployer__factory.connect(walletDeployerAddress, provider)

  const safeAddr = await walletFactory.ownerToSafe(proof.address)
  const safe = GnosisSafe__factory.connect(safeAddr, provider)
  const isOwner = await safe.isOwner(device)
  if (!isOwner) {
    return new Response("Invalid signature", { headers: corsHeaders, status: 400 });
  }

  const client = getServiceClient();

  const address = proof.address

  const connection = await pool.connect();

  try {

    const newPassword = crypto.randomUUID();
    const email = `${address.toLowerCase()}@blockchain`

    const existing = await connection.queryObject<{id: string, name: string}>({
      text: "SELECT id,email FROM auth.users WHERE email = $1 LIMIT 1",
      args: [`${address.toLowerCase()}@blockchain`],
    })

    if (existing.rows.length > 0) {
      console.log(email, "user exists, updating password");
      await connection.queryObject({
        text: "UPDATE auth.users SET encrypted_password = crypt($1, gen_salt('bf')) WHERE id = $2",
        args: [newPassword, existing.rows[0].id],
      })

    } else {
      console.log(email, "user does not exist, creating");
      const { data, error } = await client.auth.admin.createUser({
        email,
        password: newPassword,
        email_confirm: true,
      });

      if (!data.user) {
        console.error("error creating user", error);
        throw new Error("error creating user");
      }
    }

    return new Response(
      JSON.stringify({ email, password: newPassword }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch(err) {
    console.error("error in querying users: ", err)
    throw err
  } finally {
    connection.release();
  }
});
