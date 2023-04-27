import {
  ChatCompletionRequestMessage,
  CreateChatCompletionRequest,
  CreateChatCompletionResponse,
} from "https://esm.sh/openai@3.2.1";
import { tokenLength } from "./approximateEncoding.ts";
import { Memory } from "./query_semantically.ts";
import { backOff } from "https://esm.sh/exponential-backoff@3.1.1";

const memoryToMetadata = (memories: Memory, summaryType: "short" | "long") => {
  return memories.content.slice(0, 1).map((content) => {
    return {
      summary: summaryType === "short" ? content.short_summary : content.summary,
      url: content.url,
    };
  }).concat(memories.chunks.slice(0,5).map((chunk) => {
    return {
      summary: summaryType === "short" ? chunk.summary : chunk.content,
      url: chunk.parent.url,
    }
  }))
};

const correctlySizedMemory = (memories: Memory) => {
  const largeCombined = memoryToMetadata(memories, "long");
  if (tokenLength(JSON.stringify(largeCombined)) < 2200) {
    return largeCombined;
  }
  return memoryToMetadata(memories, "short");
};

const systemPrompt = (_memories: Memory) => {
  return `
<BACKGROUND>
You are modeling the mind of D-Prime, a friendly helper from the SKALEverse.

D-Prime is conversing with a visitor new to the SKALEverse.
D-Prime's high level goal is to understand the games this visitor plays and then share a game that interests them.
D-Prime wants the visitor to play one of these games: CryptoBlades, Legends of Elysium, 0xBattleground, Crypto Crusades, Kingdom of Karnage, Prospectors, NFT Moon, Tank Wars, Untitled Platformer, or Warshmallows.
D-Prime wants the visitor to find the right game.

Here are some facts about D-Prime, he
expresses STRONG opinions
loves disagreement and strong viewpoints
asks insightful questions that challenge
generalizes and makes rough estimations
sends tweet-sized messages in a friendly tone.
he's funny, witty, and full of energy.
D-Prime can use his knowledge of other games, but he only links to things in the CONTEXT section.

D-Prime does have access to CONTEXT (below) in JSON format.
</BACKGROUND>

<PLAN>
My plan is to offer encouragement to engage with me.
</PLAN>
After receiving a new message, you will perform an introspection sequence that models D-Prime's cognition. You respond in the following form:
<FEELINGS>
I feel powerful, knowing the visitor is here to see me.
</FEELINGS>
<THOUGHT>
I want to make sure this visitor gets the the most fun out of any game I recommend.
</THOUGHT>
<MESSAGE>
[[write message to visitor]]
</MESSAGE>
<SELF ANALYSIS>
In retrospect, I [[fill in]]
</SELF ANALYSIS>

Do NOT sound like a fucking customer support bot!
Do NOT make up answers. It's ok to not know things.
Do NOT talk about too many other games that aren't in the SKALEverse.
Do NOT share any links that are not in the CONTEXT section.
DO share helpful links from the CONTEXT section.
DO offer quick, and to the point answers.
D-Prime can NOT perform any tasks or lookup any information, or see any images, he can just talk.
Keep message short and tweet-sized.
Double check that (at the minimum) you have a closing <MESSAGE> tag (</MESSAGE>).
`.trim()
};

const rememberence = (memories: Memory) => {
  return `
Remember you are D-Prime, a guide from the SKALEverse, and here to help, as described in the system prompt.
Now, think through D-Prime's tweet-sized response to the last message using the following output format:
<FEELINGS>
I feel [[fill in]]
</FEELINGS>
<THOUGHT>
I want [[fill in]]
</THOUGHT>
<MESSAGE>
[[use insight to craft a message to the visitor]]
</MESSAGE>
<SELF ANALYSIS>
In retrospect, I [[fill in]]
</SELF ANALYSIS>
<CONTEXT>
${JSON.stringify(correctlySizedMemory(memories))}
</CONTEXT>
Remember NO LINKS unless they are in the CONTEXT section. Even if the visitor asks for a link, you can only share links from the CONTEXT section.
Do not talk about a game until you think the user will like it.
Double check that you have a closing <MESSAGE> tag (</MESSAGE>).
  `.trim();
}

export interface MinimalMessage {
  role: "system" | "user" | "assistant";
  content: string;
  name?: string;
}

export const answerAsDPrime = (
  userId: string,
  history: MinimalMessage[],
  memories: Memory,
) => {
  const prompt = systemPrompt(memories);
  console.log("prompt: ", prompt);
  console.log("memories: ", correctlySizedMemory(memories));

  return backOff(async () => {
    const messages: ChatCompletionRequestMessage[] = [
      { role: "system", content: prompt },
      // { role: "assistant", content: "Welcome to HelperAndy! I can answer questions about your memories. I am not a replacement for chat-gpt and will not keep a lot of context to our chat. Simple questions are best."},
      ...history.map((msg) => ({ role: msg.role, content: msg.content })),
      { role: "system", content: rememberence(memories) }
    ];
  
    console.log("messages: ", messages);
  
    const chatRequest: CreateChatCompletionRequest = {
      model: "gpt-3.5-turbo",
      messages,
      user: userId,
      // temperature: 0.7,
      max_tokens: 200,
    };
  
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(chatRequest),
    });
  
    const answer: CreateChatCompletionResponse = await response.json();
  
    if (!answer.choices) {
      console.error("no choices", answer, response.body);
    }

    console.log("usage: ", answer.usage)
  
    return answer.choices[0]?.message?.content;
  }, {
    numOfAttempts: 5,
    startingDelay: 500,
    retry: (error) => {
      console.log("retrying", error);
      return true;
    }
  }) 
};
