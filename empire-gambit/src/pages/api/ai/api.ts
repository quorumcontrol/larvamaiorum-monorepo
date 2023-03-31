import { memoize } from "./memoize";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai"

export const fetchOpenAiClient = memoize(() => {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  return new OpenAIApi(configuration);
})

export interface CompletionParameters {
  system: string
  messages: ChatCompletionRequestMessage[]
  timeout?: number
}

export async function generateCompletions({ system, messages, timeout }: CompletionParameters) {
  const openai = fetchOpenAiClient()
  return openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {"role": "system", "content": system },
      ...messages,
    ]
  }, {
    timeout: timeout || 30_000
  })
}
