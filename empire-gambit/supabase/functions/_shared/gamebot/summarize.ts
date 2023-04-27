import { CreateChatCompletionRequest, CreateChatCompletionResponse } from "https://esm.sh/openai@3.2.1"
import { splitTextIntoChunks, tokenLength } from "./approximateEncoding.ts";
import { backOff } from "https://esm.sh/exponential-backoff@3.1.1";

const systemPrompt = `
You are bot that creates summaries from text scraped from websites. Please create a one sentence summary and a paragraph-length summary of the provided text or HTML. We only care about semantically valuable text from the site. Ignore anything like html, styles, table of contents, licenses, disclaimers, navigation, ads, scripts, footers, copyrights, etc.

You will be given a text or HTML and you should parse it and respond in following format:

ignore: <true|false>,
short summary: <a one sentence summary>,
long summary: <a paragraph-long summary>,

If the text has no semantically useful content, set "ignore" to true and do not return any summaries.
Only respond in the above format, no additional text.
`.trim()

export interface SummarizeResponse {
  shortSummary:string
  longSummary:string
  ignore?: boolean
}

const parseResponse = (response: CreateChatCompletionResponse):SummarizeResponse => {
  const text = response.choices[0]?.message?.content
  if (!text) {
    throw new Error("missing text")
  }

  const ignore = text.match(/\s*ignore:\s*(true|false)/)?.[1] === "true"
  const shortSummary = text.match(/\s*short summary:\s*(.*)[^\n]/)?.[1]
  
  const longSummary = text.match(/\s*long summary:\s*(.*)[^\n]/)?.[1]

  if (!ignore && (!shortSummary || !longSummary)) {
    console.error("improper response: ", ignore, text)
    throw new Error("could not format response")
  }
 
  return {
    ignore,
    shortSummary: shortSummary || "",
    longSummary: longSummary || "",
  }
}

export const summarize = (userId: string, content: string):Promise<SummarizeResponse> => {
  if (tokenLength(content) < 100) {
    return Promise.resolve({
      shortSummary: content,
      longSummary: content,
      ignore: false
    })
  }

  const userPrompt = `
Please return a summary in the following format:

ignore: <true|false>,
short summary: <a one sentence summary>,
long summary: <a paragraph-long summary>,

Here is the content: \`${content}\`

If the text has no semantically useful content, set "ignore" to true and do not return any summaries.
Only respond in the above format, no additional text.
  `.trim()

  const completionInfo: CreateChatCompletionRequest = {
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    user: userId,
  };

  return backOff(async () => {
    const request = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(completionInfo),
    });
    const resp:CreateChatCompletionResponse = await request.json()
    
    console.log("summary usage: ", resp.usage)

    return parseResponse(resp)
  }, {
    numOfAttempts: 5,
    startingDelay: 250,
    retry: (error, i) => {
      if (i === 5) {
        console.error("failed to summarize", error)
        return false
      }
      console.error("retrying", error)
      return true
    }
  })
};

type RecursiveSummary = SummarizeResponse & { chunks: SummarizeResponse[] }

export const recursivelySummarize = async (userId: string, chunks: string[]):Promise<RecursiveSummary> => {
  const processChunks = async (chunks:string[], maxConcurrency = 20) => {
    const results = new Array(chunks.length);
    const chunksCopy = Array.from([...chunks].entries())
  
    const processNext = async () => {
      const next = chunksCopy.shift();
      if (!next) return;
      console.log("process next worker started")

      const [index, chunk] = next;
      const summary = await summarize(userId, chunk);
      results[index] = summary;
  
      // Process the next chunk in the queue.
      await processNext();
    };
  
    // Start processing multiple chunks concurrently, up to the maxConcurrency limit.
    const workers = Array.from({ length: maxConcurrency }, processNext);
    await Promise.all(workers);
  
    return results;
  };

  const summaries = await processChunks(chunks);

  // const summaries = await Promise.all(chunks.map((chunk) => summarize(userId, chunk)))
  if (chunks.length === 1) {
    return {
      ignore: summaries[0]?.ignore || false,
      shortSummary: summaries[0]?.shortSummary || "",
      longSummary: summaries[0]?.longSummary || "",
      chunks: summaries || [],
    }
  }

  // otherwise combine the summaries into a new text
  const text = summaries.filter((summary) => !summary.ignore).map((summary) => summary.longSummary).join(" ")
  if (tokenLength(text) > 1500) {
    const summary = await recursivelySummarize(userId, splitTextIntoChunks(text, 1500))
    return {
      ignore: summary.ignore,
      shortSummary: summary.shortSummary,
      longSummary: summary.longSummary,
      chunks: summaries,
    }
  }

  const summary = await summarize(userId, text)
  return {
    ignore: summary.ignore,
    shortSummary: summary.shortSummary,
    longSummary: summary.longSummary,
    chunks: summaries,
  }

}