import { assertEquals } from "https://deno.land/std@0.182.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.182.0/testing/bdd.ts";
import { load } from "https://deno.land/std@0.182.0/dotenv/mod.ts";
import ContentPipeline from "../_shared/gamebot/contentPipeline.ts";
import { saveContent } from "../_shared/gamebot/saveContent.ts";
import { testServiceClient } from "./_test_service_client.ts";

await load({
  export: true,
  envPath: "../.env.local",
});

const content = `
Pierce Harris, played by Jonathan Wrather, made his first screen appearance on 11 February 2016.[1] The character and Wrather's casting was announced on 10 January 2016.[2] Of his casting, Wrather said "I am thrilled to be joining Emmerdale. It's a great opportunity to be offered the chance to create a new character in one of TV's most popular shows and I'm very excited to be working with such an outstanding cast and team."[2] Pierce is the husband of established character, Tess Harris (Nicola Stephenson) and has been mentioned on several occasions since Tess' arrival.[2] Tess has been having an affair with Paddy Kirk (Dominic Brunt), who was described as not expecting to meet Tess' husband.[2]
`.trim()

describe("SaveContent", () => {
  it("should save the content", async () => {
    const supabase = testServiceClient()

    const pipeline = new ContentPipeline({
      scrape: {
        text: content,
      },
      tag: "test",
      userId: "d9c444f1-4e91-4abb-b4c7-1d18318990e9",
    })
    
    const parsed = await pipeline.run()
    
    const saved = await saveContent(supabase, parsed)
    assertEquals(saved, parsed.id)
    console.log("SUCCESS")
  });
})