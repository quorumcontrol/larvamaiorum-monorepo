import {
  ChatCompletionResponseMessage,
  CreateChatCompletionRequest,
} from "https://esm.sh/openai@3.2.1";
import { chatCompletion } from "./chatCompletion.ts";
import { backOff } from "https://esm.sh/exponential-backoff@3.1.1";

const systemPrompt = `
You are Minerva, goddess of wisdom and war. You just completed a fortune telling with a user. Now you are going to give them a parting gift of a small plaque commemorating the event.

You should respond with a 3 word or less title and a short paragraph mystical analysis of the conversation. For example:

The Fool

The young man is meaningful and wise. Remember, playing the fool is not a bad thing. It is a way to learn and grow. May you have safe journies.
`.trim();

type ParsedResponse = {
  title: string;
  description: string;
};

function parseMessage(message: string): ParsedResponse | null {
  const lines = message.split("\n");
  const [title, ...descriptions] = lines;

  if (!title) {
    return null
  }

  return {
    title,
    description: descriptions.filter((line)=> line && !line.match(/^\s*$/)).join('\n')
  }
}

type ChatResponse = ParsedResponse

export const nftMinter = (
  history: ChatCompletionResponseMessage[],
  attempts = 0,
  additionalPromptiong?: boolean
): Promise<ChatResponse> => {
  if (attempts > 5) {
    throw new Error("too many attempts at sanity")
  }
  return backOff(async () => {

    const userPrompt = `
Please provide me with a title and description for our chat:
${history.map((message) => {
  if (message.role === "user") {
    return `Me: ${message.content}`;
  }
  return `Minerva: ${message.content}`;
}).join("\n")}

${additionalPromptiong ? `
Please respond in the following format:
<Title>

<Description>`.trim() : ""}
`.trim()

    const request: CreateChatCompletionRequest = {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8,
      frequency_penalty: 0,
      presence_penalty: 0,
      max_tokens: 120,
    };

    const resp = await chatCompletion(request);
    const parsed = parseMessage(resp.choices[0].message?.content || "");

    if (!parsed?.title) {
      console.error("no parsed response", resp, resp.choices[0].message?.content);

      return nftMinter(history, attempts + 1, true);
      // return {
      //   raw: resp.choices[0].message?.content || "",
      //   response: resp.choices[0].message?.content || "",
      //   action: "nothing"
      // }
    }
    return {
      ...parsed
    };
  }, {
    numOfAttempts: 5,
    retry: (err, attempt) => {
      console.log(`Attempt ${attempt} failed: ${err.message}`);
      return true;
    },
  });
};
