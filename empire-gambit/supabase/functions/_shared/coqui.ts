
const minerva2 = "da7d07b2-5e10-44d6-bfd9-3c3b85aa3564"

const url = "https://app.coqui.ai/api/v2/samples"

export const createSpeech = async (userId:string, text:string, emotion="Neutral") => {
  const API_KEY = Deno.env.get("COQUI_API_KEY")
  if (!API_KEY) {
    throw new Error("No API key for Coqui")
  }

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "authorization": `Bearer ${API_KEY}`,
      "accept": "application/json",
    },
    body: JSON.stringify({
      name: `${userId}/${crypto.randomUUID()}`,
      text,
      voice_id: minerva2,
      // emotion,
    })
  })
  
  return resp.json()

}