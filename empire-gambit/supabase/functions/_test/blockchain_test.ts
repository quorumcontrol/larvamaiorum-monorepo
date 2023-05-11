import { describe, it } from "https://deno.land/std@0.182.0/testing/bdd.ts";
import { load } from "https://deno.land/std@0.182.0/dotenv/mod.ts";
import { mint } from "../_shared/blockchain.ts";
import { assertExists } from "https://deno.land/std@0.182.0/testing/asserts.ts";

await load({
  export: true,
  envPath: "../.env.local",
});

describe("blockchain", () => {
  it("should mint", async () => {
    const image = Deno.readTextFileSync("./_test/testImage.txt")
    const resp = await mint("0xFe03cB8a8B2589cAF68589c01E26e7f3b5EAcb65", {
      name: "Hello World!",
      description: "This the waking of Minerva",
      image,
    })
    assertExists(resp)
    console.log("OK", resp)
  });
})