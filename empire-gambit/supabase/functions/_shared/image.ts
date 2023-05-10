import { CreateChatCompletionRequest } from "https://esm.sh/openai@3.2.1";
import { chatCompletion } from "./chatCompletion.ts";

export const getEngines = async () => {
  const apiHost = "https://api.stability.ai";
  const url = `${apiHost}/v1/engines/list`;

  const apiKey = Deno.env.get("DREAMSTUDIO_API_KEY");
  if (!apiKey) throw new Error("Missing DREAMSTUDIO_API_KEY .");

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Non-200 response: ${await response.text()}`);
  }

  interface Payload {
    engines: Array<{
      id: string;
      name: string;
      description: string;
      type: string;
    }>;
  }

  // Do something with the payload...
  const payload = (await response.json()) as Payload;
  return payload;
};

export const createImage = async (prompt: string) => {
  const apiHost = "https://api.stability.ai";

  const apiKey = Deno.env.get("DREAMSTUDIO_API_KEY");
  if (!apiKey) throw new Error("Missing DREAMSTUDIO_API_KEY .");

  const engineId = "stable-diffusion-xl-beta-v2-2-2";

  const response = await fetch(
    `${apiHost}/v1/generation/${engineId}/text-to-image`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: prompt,
          },
        ],
        cfg_scale: 5,
        height: 704,
        width: 512,
        samples: 1,
        steps: 30,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Non-200 response: ${await response.text()}`);
  }

  interface GenerationResponse {
    artifacts: Array<{
      base64: string;
      seed: number;
      finishReason: string;
    }>;
  }

  const responseJSON = (await response.json()) as GenerationResponse;
  console.log("resp:", responseJSON)
  
  return responseJSON.artifacts[0]
};

const systemPrompt = `
You are a bot that takes a user's message and returns an image prompt to accompany the message.

Here are example prompts for Stable Diffusion which is a latent text-to-image diffusion model capable of generating photo-realistic images given any text input. Stable Diffusion is similar to DALLE-2.

Prompt 1:
Symmetry!! a 2 8 mm macro photo from the back of a woman in china, seen from a distance, splash art, movie still, bokeh, canon 5 0 mm, cinematic lighting, dramatic, film, photography, golden hour, depth of field, award - winning, anamorphic lens flare, 8 k, hyper detailed, 3 5 mm film grain，full body::9

Prompt 2:
a portrait of a roman statue man painted black with multicolored graffiti on a white background

Prompt 3:
A professional photographic view picture of a parisian alley and cafe, photographic filter unreal engine 5 realistic hyperdetailed 8 k ultradetail cinematic concept art volumetric lighting, very beautiful scenery, very realistic effect, hd, hdr, cinematic 4 k wallpaper, 8 k, sharp focus, octane render, ultra detailed, high resolution, artstation trending on artstation in the style of albert dros glowing rich colors powerful imagery

Prompt 4:
Seamless pattern, indonesia culture, red and black, 4k, detail

IMPORTANT: The prompt should be a single line of text, and should not start with "Create" or "generate." just describe the image in detail.
`.trim()

export const getImagePrompt = async (userPrompt: string) => {
  const prompt = `
Please create a Stable Diffusion prompt for an image to accompany this: "${userPrompt}"
The image should be detailed, cinematic, and vaguely ancient Roman themed.

Do not start with "Create" or "generate." just describe the image in detail.  
`.trim()

  const request:CreateChatCompletionRequest = {
    model: "gpt-3.5-turbo",
    messages: [
      {role: "system", content: systemPrompt},
      {role: "user", content: prompt}
    ],
    temperature: 0.6,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 100,
  }

  const resp = await chatCompletion(request)
  const imagePrompt = resp.choices[0].message?.content.trim()
  return imagePrompt
}

export const imageFromPrompt = async (userPrompt: string) => {
  const prompt = await getImagePrompt(userPrompt)
  console.log("prompt: ", prompt, "from", userPrompt)
  if (!prompt) {
    throw new Error("No prompt returned from OpenAI")
  }
  const image = await createImage(`${prompt}. realistic, ultra high detail, bioluminescent glows`)
  return image
}