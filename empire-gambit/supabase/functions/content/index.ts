import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.15.0";
import ContentPipeline from "../_shared/gamebot/contentPipeline.ts";
import { saveContent } from "../_shared/gamebot/saveContent.ts";

serve(async (req) => {
  console.log("Hello from urls");
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

  const { scrape, url, tag } = await req.json();
  
  try {
   
    const parsed = await new ContentPipeline({ userId: user.id, scrape: scrape.text ? scrape : undefined, url, tag }).run()

    await saveContent(serviceClient, parsed)

    console.log(`url saved for ${user.id}. Content hash: ${parsed.id}, url: ${parsed.url}, tag: ${parsed.tag}`)

    return new Response(
      JSON.stringify({ ok: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
    // return new Response(
    //   JSON.stringify({ memory }),
    //   { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    // );
  } catch(err) {
    console.error("error with parsing", err)
    throw err
  }
});
