import { memoize } from "./memoize";
import { Configuration, OpenAIApi } from "openai"

const fetchOpenAiClient = memoize(() => {
  const configuration = new Configuration({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  });
  return new OpenAIApi(configuration);
})

interface CompletionParameters {
  system: string
  prompt: string
  timeout?: number
}

export async function generateCompletions({ system, prompt, timeout }: CompletionParameters) {
  const openai = fetchOpenAiClient()
  return openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {"role": "system", "content": system },
      {"role": "user", "content": prompt },
    ]
  }, {
    timeout: timeout || 30_000
  })
}
