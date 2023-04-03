import { expect } from 'chai'
import { createMatch } from "../src/database/matchWriter"

describe.only("TestDatabase", () => {
  it("saves a match", async () => {
    const matchId = await createMatch(["p1", "p2"])
    expect(matchId).to.be.ok
  })
})