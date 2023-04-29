import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import { memoize } from "./memoize";

const voice = "en-US-Studio-O";

const getClient = memoize(() => {
  const cli = {
    project_id: "helperandy",
    client_email: process.env["GCP_EMAIL"],
    private_key: process.env["GCP_PRIVATE_KEY"].split("\\n").join("\n"),
  };

  return new TextToSpeechClient({ credentials: cli });
})

export const speak = async (text: string) => {
  try {
    
    const client = getClient()

    // Performs the text-to-speech request
    const [response] = await client.synthesizeSpeech({
      input: { text },
      // Select the language and SSML voice gender (optional)
      voice: { languageCode: "en-US", name: voice },
      // select the type of audio encoding
      audioConfig: {
        audioEncoding: "MP3",
      },
    });

    return `data:audio/mpeg;base64,${Buffer.from(response.audioContent).toString("base64")}`
  } catch (err) {
    console.error("error in speak", err);
    return undefined;
  }
};
