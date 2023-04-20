import {  assertEquals, assertExists } from "https://deno.land/std@0.182.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.182.0/testing/bdd.ts";
import { load } from "https://deno.land/std@0.182.0/dotenv/mod.ts";
import { createImage, getImagePrompt } from "../_shared/image.ts";

await load({
  export: true,
  envPath: "../.env.local",
});

describe("Image", () => {
  it("generates an image", async () => {
    const img = await createImage("A Stunning House")
    console.log("img: ", img)
    assertExists(img.base64)
  });

  it("gets an image prompt", async () => {
    const prompt = await getImagePrompt("I'm feeling sad and lonely. I want to go to a party.")
    console.log("prompt: ", prompt)
    assertExists(prompt)
  })

})