import { CreateChatCompletionResponse, CreateChatCompletionRequest } from "https://esm.sh/openai@3.2.1";

export const chatCompletion = async (chatCompletionRequest: CreateChatCompletionRequest): Promise<CreateChatCompletionResponse> => {
  const start = new Date()
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(chatCompletionRequest),
  });

  const resp:CreateChatCompletionResponse = await response.json()
  const end = new Date()
  
  console.log("chatCompletion", end.getTime() - start.getTime(), "ms")

  if (!resp.choices) {
    console.error("no choices", resp, response.body);
  }

  return resp
}