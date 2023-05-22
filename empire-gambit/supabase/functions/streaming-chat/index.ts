// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.15.0";
import { minervaChat } from "../_shared/streamingChat.ts";

serve(async (req) => {
  console.log("Hello from streaming streaming chat!");
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
    console.error("no user")
    return new Response("Not authorized", { status: 401 });
  }

  const { history } = await req.json()
  console.log("received history: ", history)
  
  const chat = await minervaChat(history)
  console.log("chat: ", chat)

  if (!chat.body) {
    console.error("error no body", chat)
    return new Response("Unknown Error", { status: 500 });
  }

  // const speech = await createSpeech(getServiceClient(), user.id, chat.response)
  return new Response(chat.body, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
    },
  })
})
