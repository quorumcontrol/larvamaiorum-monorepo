// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.15.0";
import { minervaChat } from "../_shared/streamingChat.ts";
import { backOff } from "https://esm.sh/exponential-backoff@3.1.1";

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

  try {
    return await backOff(async () => {
      const chat = await minervaChat(history)
    
      if (!chat.body) {
        console.error("missing body", chat)
        throw new Error(`No Chat Body: ${chat.status}`)
      }
  
      if (![200,201].includes(chat.status)) {
        console.error("invalid status code", chat)
        throw new Error(`invalid chat completion status code: ${chat.status}`)
      }
    
      // const speech = await createSpeech(getServiceClient(), user.id, chat.response)
      return new Response(chat.body, {
        status: 201,
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
        },
      })
  
    }, {
      numOfAttempts: 5,
      delayFirstAttempt: false,
      startingDelay: 250,
    })
  } catch (err) {
    console.error("error", err)
    return new Response("Unknown Error", { ...corsHeaders, status: 500 });
  }
})
