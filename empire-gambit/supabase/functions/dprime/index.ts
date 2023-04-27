import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.15.0";
import * as postgres from "https://deno.land/x/postgres@v0.14.2/mod.ts";
import { querySemantically } from "../_shared/gamebot/query_semantically.ts";
import { answerAsDPrime } from "../_shared/gamebot/dPrime.ts";

export interface MinimalMessage {
  role: "system" | "user" | "assistant"
  content: string
  name?: string
}

// Get the connection string from the environment variable "SUPABASE_DB_URL"
const databaseUrl = Deno.env.get("SUPABASE_DB_URL")!;

// Create a database pool with three connections that are lazily established
const pool = new postgres.Pool(databaseUrl, 3, true);

serve(async (req) => {
  console.log("Hello from dprime chat");
  if (req.method === "OPTIONS") {
    console.log("OPTIONS");
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

  const serviceClient = createClient(
    // Supabase API URL - env var exported by default.
    Deno.env.get("SUPABASE_URL") ?? "",
    // Supabase API ANON KEY - env var exported by default.
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (!user) {
    return new Response("Not authorized", { status: 401 });
  }

  console.log("user", user.id);

  const { messages }:{ messages: MinimalMessage[] } = await req.json();

  const connection = await pool.connect();
  
  try {

    // connection: QueryClient,
    // client: SupabaseClient<Database>,
    // content: string,
    // tagIds: string[],
    // max?: number,
    // limit?: number,
    // userId?: string,

    // get the most important memories based on the entire history of messages
    const memories = await querySemantically({
      connection,
      client: serviceClient,
      content: messages.filter((m) => m.role !== "system").map(m => m.content).join(" "),
      tagIds: ["empiregambit", "legendsofelysium", "0xbattleground", "cryptocrusades", "kingdomkarnage", "prospectors", "nftmoon", "tankwars", "untitledplatformer", "warshmallows"],
      limit: 5,
      userId: user.id,
    });

    const response = await answerAsDPrime(user.id, messages, memories);
    
    return new Response(
      JSON.stringify({ response }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } finally {
    connection.release();
  }
});
