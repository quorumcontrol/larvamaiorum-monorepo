import SimpleSyncher from "@/utils/SimpleSyncher";
import { fetchAudio, fetchAudioContext } from "@/utils/audioContext";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useState } from "react";

export const useSpeechQueue = () => {
  const client = useSupabaseClient();
  const [playQueue] = useState(new SimpleSyncher());

  const queueSpeech = (text: string) => {
    const audioContext = fetchAudioContext();
    if (audioContext.state === "suspended") {
      audioContext.resume();
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

      const audio = fetchAudio()
      audio.src = audio_url
      audio.play()

      await new Promise((resolve) => {
        audio.onended = () => {
          resolve(audio_url);
        };
      });
    });
  };

  return {
    queueSpeech,
    setOnEnded: (fn: () => any) => {
      playQueue.onEnded(fn);
    },
  };
};
