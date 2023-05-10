import SimpleSyncher from "@/utils/SimpleSyncher";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useState } from "react";

export const useSpeechQueue = () => {
  const client = useSupabaseClient();
  const [queue] = useState(new SimpleSyncher());
  const [_audio, setAudio] = useState<HTMLAudioElement>();

  const findOrCreateAudio = () => {
    let audio: HTMLAudioElement;
    setAudio((prev) => {
      if (prev) {
        audio = prev;
        return prev;
      }
      audio = new Audio();
      return audio;
    });
    return audio!;
  };

  // TODO: let's actually *fetch* the audio before playing it
  const queueSpeech = (text: string) => {
    queue.push(async () => {
      const { data, error } = await client.functions.invoke("voice", {
        body: { text },
      });
      if (error) {
        console.error(error);
        throw error;
      }

      const { data: { publicUrl } } = client.storage.from("audio").getPublicUrl(
        data.speech,
      );
      console.log("speech back: ", publicUrl);

      if (!publicUrl) {
        console.error("no public url from text")
      }

      const audio = findOrCreateAudio();

      audio.src = publicUrl;
      console.log("Playing: ", publicUrl);
      audio.play();
      await new Promise((resolve) => {
        audio.onended = () => {
          resolve(publicUrl);
        };
      })
    });
  };

  return {
    queueSpeech,
  };
};
