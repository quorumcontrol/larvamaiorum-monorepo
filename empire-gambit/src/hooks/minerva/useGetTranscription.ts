import { useSupabaseClient } from "@supabase/auth-helpers-react";

export const useGetTranscription = () => {
  const client = useSupabaseClient()

  return async (audioBlob: Blob):Promise<string|undefined> => {
    console.log("client: ", client)
    const ending = audioBlob.type.split("/")[1]

    const formData = new FormData();
    formData.append("file", audioBlob, `audio.${ending}`)

    console.log("blob: ", audioBlob, audioBlob.size)

    const resp = await client.functions.invoke("transcribe", {
      body: formData
    })

    console.log("response from transcribe: ", resp)
    return resp.data?.transcription.text
  }
}