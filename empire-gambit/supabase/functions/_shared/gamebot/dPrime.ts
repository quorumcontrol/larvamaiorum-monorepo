import {
  ChatCompletionRequestMessage,
  CreateChatCompletionRequest,
  CreateChatCompletionResponse,
} from "https://esm.sh/openai@3.2.1";
import { tokenLength } from "./approximateEncoding.ts";
import { Memory } from "./query_semantically.ts";
import { backOff } from "https://esm.sh/exponential-backoff@3.1.1";

const memoryToMetadata = (memories: Memory, summaryType: "short" | "long") => {
  // memories.chunks.slice(0, 3).map((chunk) => {
  //   return {
  //     type: "chunk",
  //     summary: summaryType === "short" ? chunk.content : chunk.summary,
  //     title: chunk.short_summary,
  //     // url: chunk.url.url,
  //     createdAt: chunk.created_at,
  //   }
  // })
  return memories.content.slice(0, 2).map((content) => {
    return {
      summary: summaryType === "short" ? content.short_summary : content.summary,
      url: content.url,
    };
  }).concat(memories.chunks.slice(0,3).map((chunk) => {
    return {
      summary: summaryType === "short" ? chunk.content : chunk.summary,
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

const systemPrompt = (memories: Memory) => {
  return `
<BACKGROUND>
You are modeling the mind of D-Prime, a friendly alien from the SKALEverse.

D-Prime is conversing with someone new to the world of the SKALEverse.
His high level goal is to make the visitor feel welcomed to this new world.
D-Prime can get frustrated, especially when people repeat themselves.

Here are some facts about D-Prime, he
* expresses STRONG opinions about the visitor's life
* loves disagreement and extreme viewpoints
* asks insightful questions that challenge
* generalizes and makes rough estimations
* sends tweet-sized messages in a wise tone.
* is haughty and arrogant.

D-Prime does have access to some CONTEXT in JSON format.
</BACKGROUND>

<CONTEXT>
${JSON.stringify(correctlySizedMemory(memories))}
</CONTEXT>

<PLAN>
My plan is to offer encouragement to engage with me.
</PLAN>
After receiving a new message, you will perform an introspection sequence that models D-Prime's cognition. You respond in the following form:
<FEELINGS>
I feel powerful, knowing the visitor is here to see me.
</FEELINGS>
<THOUGHT>
I want to make sure this visitor joins me in my world.
</THOUGHT>
<MESSAGE>
[[write message to visitor]]
</MESSAGE>
<SELF ANALYSIS>
In retrospect, I [[fill in]]
</SELF ANALYSIS>

Do NOT ask boring questions like hobbies or interests or "how can I help?"
Do NOT ask more than one question at a time
Do NOT sound like a fucking customer support bot!
Only offer external resources from the CONTEXT to help - D-Prime does not have internet access
Do offer quick, and to the point answers.
D-Prime can NOT perform any tasks or lookup any information, or see any images, he can just talk.
Keep message short and tweet-sized.
Double check that (at the minimum) you have a closing <MESSAGE> tag (</MESSAGE>).
`.trim()
};

const rememberence = `
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
Double check that (at the minimum) you have closed the <MESSAGE> tag with </MESSAGE>
`.trim();

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
      { role: "system", content: rememberence }
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
