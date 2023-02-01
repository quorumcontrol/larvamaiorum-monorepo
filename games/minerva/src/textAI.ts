import axios, { AxiosPromise } from "axios";
// import ThenArg from "./ThenArg";

const apiKey = process.env.REACT_APP_OPENAI_API_KEY;

interface CompletionParameters {
  apiKey: string;
  engine: string;
  maxTokens: number;
  stop: string | Array<string>;
  prompt: string;
  temperature: number;
  topP: number;
  presencePenalty: number;
  frequencyPenalty: number;
}

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

export function generateCompletions(
  prompt: string | Array<string>,
  completionParams: CompletionParameters,
  n: number = 1
): AxiosPromise {
  return axios({
    method: "POST",
    url: `https://api.openai.com/v1/engines/${completionParams.engine}/completions`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${completionParams.apiKey}`,
    },
    data: {
      prompt: prompt,
      n: n,
      max_tokens: completionParams.maxTokens,
      temperature: completionParams.temperature,
      stop: completionParams.stop,
      top_p: completionParams.topP,
      presence_penalty: completionParams.presencePenalty,
      frequency_penalty: completionParams.frequencyPenalty,
    },
  });
}
