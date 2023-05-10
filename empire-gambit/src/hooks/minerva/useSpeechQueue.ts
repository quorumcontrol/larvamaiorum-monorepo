import SimpleSyncher from "@/utils/SimpleSyncher";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useState } from "react";

export const useSpeechQueue = () => {
  const client = useSupabaseClient();
  const [playQueue] = useState(new SimpleSyncher());
  const [audio] = useState(
    (typeof Audio === "undefined") ? undefined : new Audio(),
  );

  const queueSpeech = (text: string) => {
    if (!audio) {
      console.error("must be serverside audio");
      return;
    }

    if (!text) {
      console.error("no text: ", text);
      return;
    }

    const fetchPromise = client.functions.invoke("voice", {
      body: { text },
    });

    playQueue.push(async () => {
      const { data, error } = await fetchPromise;
      if (error) {
        console.error(error);
        throw error;
      }

      const { speech: { audio_url } } = data;
      
      if (!audio_url) {
        console.error("no public url from text", data);
        throw new Error("no public url");
      }

      audio.src = audio_url;
      console.log("Playing: ", audio_url);
      audio.play();
      await new Promise((resolve) => {
        audio.onended = () => {
          resolve(audio_url);
        };
      });
    });
  };

  return {
    queueSpeech,
  };
};
