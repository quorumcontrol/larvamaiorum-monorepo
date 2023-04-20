import { assertExists } from "https://deno.land/std@0.182.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.182.0/testing/bdd.ts";
// import * as jwt from "https://esm.sh/jsonwebtoken@9.0.0"
import {
  create,
  getNumericDate,
  Header,
  Payload,
  verify,
} from "https://deno.land/x/djwt@v2.4/mod.ts";

describe("jwt", () => {
  it("sanity", async () => {
    // const payload = {
    //   userId: 'some_user_id',
    //   role: 'some_role',
    //   // Additional claims if needed
    // };

    // // Sign the JWT using the secret key and set an expiration time
    // const token = jwt.sign(payload, "super-secret-jwt-token-with-at-least-32-characters-long", { expiresIn: '1h' });
    // assertExists(token)

    const encoder = new TextEncoder();
    const keyBuf = encoder.encode("super-secret-jwt-token-with-at-least-32-characters-long");

    const key = await crypto.subtle.importKey(
      "raw",
      keyBuf,
      { name: "HMAC", hash: "SHA-256" },
      true,
      ["sign", "verify"],
    );

    const payload: Payload = {
      iss: "deno-demo",
      exp: getNumericDate(300), // expires in 5 min.
    };

    const algorithm = "HS256";

    const header: Header = {
      alg: algorithm,
      typ: "JWT",
      foo: "bar", // custom header
    };

    const jwt = await create(header, payload, key);

    console.log(jwt);
  });
});
