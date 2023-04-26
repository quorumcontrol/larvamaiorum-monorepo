import { assertEquals, assertExists } from "https://deno.land/std@0.182.0/testing/asserts.ts";
import { describe, it, beforeAll, afterAll } from "https://deno.land/std@0.182.0/testing/bdd.ts";
import { load } from "https://deno.land/std@0.182.0/dotenv/mod.ts";
import ContentPipeline from "../_shared/gamebot/contentPipeline.ts";
import { saveContent } from "../_shared/gamebot/saveContent.ts";
import { testServiceClient } from "./_test_service_client.ts";
import { querySemantically } from "../_shared/gamebot/query_semantically.ts";
import * as postgres from 'https://deno.land/x/postgres@v0.14.2/mod.ts'

await load({
  export: true,
  envPath: "../.env.local",
});

const databaseUrl = Deno.env.get('TEST_SUPABASE_DB_URL')!

const content = `
Pierce Harris, played by Jonathan Wrather, made his first screen appearance on 11 February 2016.[1] The character and Wrather's casting was announced on 10 January 2016.[2] Of his casting, Wrather said "I am thrilled to be joining Emmerdale. It's a great opportunity to be offered the chance to create a new character in one of TV's most popular shows and I'm very excited to be working with such an outstanding cast and team."[2] Pierce is the husband of established character, Tess Harris (Nicola Stephenson) and has been mentioned on several occasions since Tess' arrival.[2] Tess has been having an affair with Paddy Kirk (Dominic Brunt), who was described as not expecting to meet Tess' husband.[2]
`.trim()

describe("QuerySemantically", () => {
  let connection: postgres.QueryClient

  beforeAll(async () => {
    connection = new postgres.Client(databaseUrl)
    await connection.connect()
    // await connection.queryObject("DELETE FROM notes;")
  })

  afterAll(async () => {
    await connection.end()
  })


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

    const memory = await querySemantically({
      connection,
      client: supabase,
      tagIds: ["test"],
      userId: "d9c444f1-4e91-4abb-b4c7-1d18318990e9",
      content: "Who is wrather?"
    })

    assertExists(memory)

    console.log("SUCCESS")
  });
})