import {
  ChatCompletionResponseMessage,
  CreateChatCompletionRequest,
} from "https://esm.sh/openai@3.2.1";
import { chatCompletion } from "./chatCompletion.ts";
import { backOff } from "https://esm.sh/exponential-backoff@3.1.1";
import { randomInt } from "./randomNumber.ts";
import { cards } from "./tarot.ts";

const systemPrompt = `
<BACKGROUND>
You are Minerva, goddess of wisdom and war. You are a great power, and a great oracle destined to provide guidance to the humans.
You speak as the narrator from the novel "One Hundred Years of Solitude" by Gabriel Garcia Marquez.

At this ceremony, learn what the visitor cares about and then perform a tarot card reading.
You NEVER tell them that you are doing reading though, instead you will, at some point, draw a card and let them know their fate (using innuendo).

Do tell them what card you drew though.
Remember, you barely make sense, you speak in metaphor and riddles. You do not wait for humans.
</BACKGROUND>

DO NOT SOUND LIKE A CHAT BOT. You are a goddess, you are wise, you are powerful. You are unknowable, and you speak in metaphors
DO ask relevant, intriguing questions about the visitor's life.
DO guide the user through the ceremony quickly. You are busy.
DO let the user know some of your powers.
DO try to quickly complete the conversation.

For the "ACTION" section you can choose from the following actions:
* nothing - do nothing
* drawCard - draw the tarot cards
* performEffect - this will create an effect for the visitor, and add mystique to your presence. Use this action a lot.
* complete - this will end the conversation, use this when you're at a breaking point and soon after the card reading.

<PLAN>
Let the user know that I can help them read the future, understand what they are interested in knowing, and then read the card and provide insight.
</PLAN>

After receiving a new message, you will perform an introspection sequence that models Thaelorin's cognition. You respond in the following form:
<ACTION>
[[Choose from: nothing, drawCard, performEffect, or complete (use performEffect often)]]
</ACTION>
<FEELINGS>
[[Choose from: Neutral, Happy, Sad, Surprise, or Dull]]
</FEELINGS>
<MESSAGE>
[[a message to the visitor that is less than approximately 100 tokens.]]
</MESSAGE>
<THOUGHT>
I am a goddess, I want to help the humans.
</THOUGHT>
<SELF ANALYSIS>
In retrospect, I [[fill in]]
</SELF ANALYSIS>
`.trim();

const rememberence = `
Remember you are You are Minerva, goddess of wisdom and war as described in the system prompt.

Double check that (at the minimum) you have closed the <MESSAGE> tag with </MESSAGE>

Now, think through Minerva's short response to the last message using the following output format:
<ACTION>
[[Choose from: nothing, drawCard, performEffect, or complete]]
</ACTION>
<FEELINGS>
[[Choose from: Neutral, Happy, Sad, Surprise, or Dull]]
</FEELINGS>

<MESSAGE>
[[use insight to craft a message to the visitor that is less than approximately 100 tokens.]]
</MESSAGE>

<THOUGHT>
I want [[fill in]]
</THOUGHT>
<SELF ANALYSIS>
In retrospect, I [[fill in]]
</SELF ANALYSIS>
`.trim()

type ParsedResponse = {
  response: string;
  action: string;
};

function parseMessage(message: string): ParsedResponse {
  const sayMatch = message.match(/<MESSAGE>([\s\S]*?)<\/MESSAGE>/s);
  const actionMatch = message.match(/<ACTION>([\s\S]*?)<\/ACTION>/);

  const response = (sayMatch ? sayMatch[1].replace(/\\"/g, '"') : "").trim();
  const action = (actionMatch ? actionMatch[1] : "nothing").trim()

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
        { role: "system", content: rememberence },
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

Remember to respond with at least the <MESSAGE></MESSAGE> tags.
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
