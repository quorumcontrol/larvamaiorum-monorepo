import { memoize } from "./memoize";
import { Configuration, OpenAIApi } from "openai"

const fetchOpenAiClient = memoize(() => {
  const configuration = new Configuration({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  });
  return new OpenAIApi(configuration);
})

// import axios, { AxiosPromise } from "axios";
// import ThenArg from "./ThenArg";

// export const fetchApiKey = () => {
//   const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
//   if (!apiKey) {
//     throw new Error("missing api key")
//   }
//   return apiKey
// }

interface CompletionParameters {
  system: string
  prompt: string
}

// interface CompletionParameters {
//   apiKey: string;
//   engine: string;
//   maxTokens: number;
//   stop: string | Array<string>;
//   prompt: string;
//   temperature: number;
//   topP: number;
//   presencePenalty: number;
//   frequencyPenalty: number;
// }

// export function cleanHistory(history: string) {
//   return history
//     .split("\n")
//     .filter((line) => {
//       return (
//         line && line.slice(0, 2) !== "##" && line[0] !== "[" && line !== "\n"
//       );
//     })
//     .join("\n");
// }

export async function generateCompletions({ system, prompt }: CompletionParameters) {
  const openai = fetchOpenAiClient()
  return openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {"role": "system", "content": system },
      {"role": "user", "content": prompt },
    ]
  })
}

// export function generateCompletions(
//   prompt: string | Array<string>,
//   completionParams: CompletionParameters,
//   n: number = 1
// ): AxiosPromise<{ choices: Array<{ text: string }> }> {
//   return axios({
//     method: "POST",
//     url: `https://api.openai.com/v1/engines/${completionParams.engine}/completions`,
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${completionParams.apiKey}`,
//     },
//     data: {
//       prompt: prompt,
//       n: n,
//       max_tokens: completionParams.maxTokens,
//       temperature: completionParams.temperature,
//       stop: completionParams.stop,
//       top_p: completionParams.topP,
//       presence_penalty: completionParams.presencePenalty,
//       frequency_penalty: completionParams.frequencyPenalty,
//     },
//   });


// }
