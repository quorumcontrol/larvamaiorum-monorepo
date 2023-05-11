import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.15.0";
import { imageFromPrompt } from "../_shared/image.ts";

function base64ToByteArray(base64String: string): Uint8Array {
  const binaryString = atob(base64String);
  const byteArray = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    byteArray[i] = binaryString.charCodeAt(i);
  }

  return byteArray;
}

serve(async (req) => {
  console.log("Hello from images!");
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

  try {
    const { 
      prompt,
      width,
      height, 
    } = await req.json();

    console.log("user", user.id);

    const image = await imageFromPrompt(prompt, width, height)
    const bytes = base64ToByteArray(image.base64)
    const storeResponse = await supabaseServiceClient.storage.from("images").upload(`user-${user.id}/${crypto.randomUUID()}.png`, bytes, { contentType: "image/png"})
  
    console.log("storeResponse", storeResponse)

    if (!storeResponse.data?.path) {
      throw new Error(storeResponse.error?.message ?? "Unknown error storing image.")
    }

    return new Response(
      JSON.stringify({ path: storeResponse.data.path }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.log("transcription error", err);
    return new Response("Error", { status: 500 });
  }
});
