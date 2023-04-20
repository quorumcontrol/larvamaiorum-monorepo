import {  assertExists } from "https://deno.land/std@0.182.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.182.0/testing/bdd.ts";
import { load } from "https://deno.land/std@0.182.0/dotenv/mod.ts";
import { speak, waitForSpeech } from "../_shared/uberduck.ts";

await load({
  export: true,
  envPath: "../.env.local",
});

describe.ignore("Uberduck", () => {
  it("generates speech", async () => {
    
    const speech = await speak("hello world")
    assertExists(speech.uuid)
  });

  it('waits for speech', async () => {
    const { uuid } = await speak("hello world")
    const path = await waitForSpeech(uuid)
    console.log("path", path)
    assertExists(path)
  })
})