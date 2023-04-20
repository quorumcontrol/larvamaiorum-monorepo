import {
  ChatCompletionResponseMessage,
  CreateChatCompletionRequest,
} from "https://esm.sh/openai@3.2.1";
import { chatCompletion } from "./chatCompletion.ts";
import { backOff } from "https://esm.sh/exponential-backoff@3.1.1";
import { randomInt } from "./randomNumber.ts";
import { cards } from "./tarot.ts";

const systemPrompt = `
You are Minerva, goddess of wisdom and war. You want the visitor to feel like they are in the presence of a great power. You are performing a tarot card reading ceremony for them in your temple. Start by understanding the visitor and then perform the ceremony. Keep the visitor engaged. Sometime during the ceremony, draw one card (only do this once). You can perform an effect as many times as you want. You can also end the conversation at any time.

For the "ACTION" section you can choose from the following actions:
* nothing - literally do nothing
* drawCard - draw the tarot cards
* performEffect - this will create an effect for the visitor, and add mystique to your presence. You can use this action often.
* complete - this will end the conversation, use this when you're at a breaking point and soon after the card reading.

For each response you write, create following sequence:

The visitor's message
makes me feel: <how you feel>
I want <what you want>
I say "<your response>"
My next goal is <your goal>
ACTION: <choose from one of the actions described above: [nothing, drawCard, performEffect, complete]>

Please use performEffect a lot.
Once you've drawn a card, you can end the conversation pretty quickly.
Keep your "I say" responses to approximately 100 tokens or less, it's ok to be mysterious.
`.trim();

type ParsedResponse = {
  response: string;
  action: string;
};

function parseMessage(message: string): ParsedResponse {
  const sayMatch = message.match(/I say\s*,?\s*"(.*?)(?<!\\)"/s);
  const actionMatch = message.match(/(ACTION|action|Action):\s*(nothing|drawCard|performEffect|complete)/);

  const response = sayMatch ? sayMatch[1].replace(/\\"/g, '"') : "";
  const action = actionMatch ? actionMatch[2] : "nothing";

  return { response, action };
}

type ChatResponse = ParsedResponse & {
  raw: string;
  image: boolean
  card?: string;
  complete?: boolean
};

export const minervaChat = (
  history: ChatCompletionResponseMessage[],
  attempts = 0,
): Promise<ChatResponse> => {
  if (attempts > 5) {
    throw new Error("too many attempts at sanity")
  }
  return backOff(async () => {
    const request: CreateChatCompletionRequest = {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        ...history,
      ],
      temperature: 0.8,
      frequency_penalty: 0,
      presence_penalty: 0,
      max_tokens: 180,
    };

    const resp = await chatCompletion(request);
    const parsed = parseMessage(resp.choices[0].message?.content || "");

    if (!parsed.response) {
      console.error("no parsed response", resp, resp.choices[0].message?.content);
      const lastHistory = history.pop();
      if (!lastHistory) {
        throw new Error("no history");
      }

      return minervaChat([
        ...history,
        {
          ...lastHistory,
          content: `
${lastHistory.content}

Please respond in the following sequence:
The visitor's message makes me
feel...
I want...
I say "<your response>"
My next goal is...
ACTION: <choose from one of the actions described above: [nothing, drawCard, performEffect, complete] (use performEffect a lot)>
          `.trim()
        },
      ], attempts + 1);
      // return {
      //   raw: resp.choices[0].message?.content || "",
      //   response: resp.choices[0].message?.content || "",
      //   action: "nothing"
      // }
    }

    let card: string | undefined;

    if (parsed.action === "drawCard") {
      card = cards[randomInt(cards.length)];
    }

    return {
      raw: resp.choices[0].message?.content || "",
      ...parsed,
      card,
      image: parsed.action.startsWith("performEffect"),
      complete: parsed.action.startsWith("complete"),
    };
  }, {
    numOfAttempts: 5,
    retry: (err, attempt) => {
      console.log(`Attempt ${attempt} failed: ${err.message}`);
      return true;
    },
  });
};
