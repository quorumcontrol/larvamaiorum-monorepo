import { assertExists } from "https://deno.land/std@0.182.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.182.0/testing/bdd.ts";
import { load } from "https://deno.land/std@0.182.0/dotenv/mod.ts";
import { nftMinter } from "../_shared/nftMinter.ts";
import { ChatCompletionRequestMessage } from "https://esm.sh/openai@3.2.1";

await load({
  export: true,
  envPath: "../.env.local",
});

describe("NFTMinter", () => {
  it("generates a title and description", async () => {
    const history:ChatCompletionRequestMessage[] = [{role: "user", content: "I'm feeling sad and lonely. I want to go to a party."}]
    const nft = await nftMinter(history)
    console.log("resp: ", nft)
    assertExists(nft.title)
    assertExists(nft.description)
  });
})