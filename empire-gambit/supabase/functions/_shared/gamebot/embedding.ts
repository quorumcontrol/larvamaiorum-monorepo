import { CreateEmbeddingRequest, CreateEmbeddingResponse } from "https://esm.sh/openai@3.2.1"

export const createEmbedding = async (content:string, userId = "empire-gambit-service"):Promise<number[]> => {

const embeddingConfig:CreateEmbeddingRequest = {
  input: content.replace(/\s{2,}/g, " "),
  model: "text-embedding-ada-002",
  user: userId,
}

const resp = await fetch('https://api.openai.com/v1/embeddings', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(embeddingConfig),
})

  const answer:CreateEmbeddingResponse = await resp.json()
  if (!answer.data[0]) {
    console.error('error creating embedding', answer, resp)
    throw new Error('did not receive embedding')
  }
  console.log("usage: ", answer.usage)

  return answer.data[0].embedding
}