import {
  auth,
  texttospeech,
} from "https://googleapis.deno.dev/v1/texttospeech:v1.ts";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.15.0";

const voice = "en-US-Studio-O";

export const fetchSpeech = async (text: string) => {
  const cli = auth.fromJSON({
    project_id: "helperandy",
    client_email: Deno.env.get("GCP_EMAIL"),
    private_key: Deno.env.get("GCP_PRIVATE_KEY")!.split("\\n").join("\n"),
  });

  const client = new texttospeech(cli);
  // The text to synthesize

  // Performs the text-to-speech request
  const response = await client.textSynthesize({
    input: { text },
    // Select the language and SSML voice gender (optional)
    voice: { languageCode: "en-US", name: voice },
    // select the type of audio encoding
    audioConfig: {
      audioEncoding: "MP3",
    },
  });
  // Write

  if (!response.audioContent) {
    throw new Error("no audio");
  }
  return response.audioContent;
};

export const createSpeech = async (
  client: SupabaseClient,
  userId: string,
  text: string,
) => {
  const audioContent = await fetchSpeech(text);

  const storeResponse = await client.storage.from("audio").upload(
    `user-${userId}/${crypto.randomUUID()}.mp3`,
    audioContent,
    { contentType: "audio/mpeg" },
  );

  console.log("storeResponse", storeResponse);

  if (!storeResponse.data?.path) {
    throw new Error(
      storeResponse.error?.message ?? "Unknown error storing audio.",
    );
  }
  
  return storeResponse.data.path;
};
