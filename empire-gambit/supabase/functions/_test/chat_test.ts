import { assertExists } from "https://deno.land/std@0.182.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.182.0/testing/bdd.ts";
import { minervaChat } from "../_shared/chat.ts";
import { load } from "https://deno.land/std@0.182.0/dotenv/mod.ts";

await load({
  export: true,
  envPath: "../.env.local",
});

describe("chatCompletion", () => {
  it("should return a response", async () => {
    const resp = await minervaChat([{
      role: "user", content: "hi"
    }])

    console.log(resp)

    console.log(resp.raw)

    assertExists(resp?.action)
    assertExists(resp?.response)
  });
})