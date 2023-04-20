import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.15.0";

serve(async (req) => {
  console.log("Hello from transcribe!");
  if (req.method === "OPTIONS") {
    console.log("OPTIONS", corsHeaders);
    return new Response("ok", { headers: corsHeaders });
  }

  console.log("not options", Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_ANON_KEY"))

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

  try {

    console.log("user", user.id);

    const requestFormData = await req.formData()
    const file = requestFormData.get('file') as File

    console.log("parsed file from request", file.size, file.name, file.type)
    
    const transcriptionFormData = new FormData()
    transcriptionFormData.append('file', file)
    transcriptionFormData.append("model", "whisper-1")
    transcriptionFormData.append("language", "en")
    transcriptionFormData.append("response_format", "json")
    // transcriptionFormData.append("prompt", "A user of an app that helps people remember things just recorded this voice memo.")

    console.log("form data: ", transcriptionFormData)

    const request = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
        // "Content-Type": "multipart/form-data",
      },
      body: transcriptionFormData,
    });

    const transcription = await request.json()

    console.log("transcription response:", transcription)
  
    return new Response(
      JSON.stringify({ transcription }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.log("transcription error", err);
    return new Response("Error", { status: 500 });
  }
});
