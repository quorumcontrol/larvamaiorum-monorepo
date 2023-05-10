import { CreateChatCompletionResponse, CreateChatCompletionRequest } from "https://esm.sh/openai@3.2.1";

export const chatCompletion = async (chatCompletionRequest: CreateChatCompletionRequest): Promise<CreateChatCompletionResponse> => {

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(chatCompletionRequest),
  });

  return response.json() as Promise<CreateChatCompletionResponse>
}

export const streamingChatCompletion = async (chatCompletionRequest: CreateChatCompletionRequest): Promise<Response> => {
  chatCompletionRequest.stream = true;
  
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(chatCompletionRequest),
  });

  return response
}