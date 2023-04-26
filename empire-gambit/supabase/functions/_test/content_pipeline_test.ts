import { assertEquals, assertExists } from "https://deno.land/std@0.182.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.182.0/testing/bdd.ts";
import { load } from "https://deno.land/std@0.182.0/dotenv/mod.ts";
import ContentPipeline from "../_shared/gamebot/contentPipeline.ts";

await load({
  export: true,
  envPath: "../.env.local",
});

const content = `
Pierce Harris, played by Jonathan Wrather, made his first screen appearance on 11 February 2016.[1] The character and Wrather's casting was announced on 10 January 2016.[2] Of his casting, Wrather said "I am thrilled to be joining Emmerdale. It's a great opportunity to be offered the chance to create a new character in one of TV's most popular shows and I'm very excited to be working with such an outstanding cast and team."[2] Pierce is the husband of established character, Tess Harris (Nicola Stephenson) and has been mentioned on several occasions since Tess' arrival.[2] Tess has been having an affair with Paddy Kirk (Dominic Brunt), who was described as not expecting to meet Tess' husband.[2]
`.trim()

describe("ContentPipeline", () => {
  it("should return a response", async () => {
    const pipeline = new ContentPipeline({
      scrape: {
        text: content,
      },
      tag: "test",
      userId: "test",
    })
    
    const parsed = await pipeline.run()
    assertExists(parsed.embedding)
    assertEquals(parsed.text, content)
  });
})