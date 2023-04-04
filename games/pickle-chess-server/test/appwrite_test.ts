import { expect } from 'chai'
import { createMatch, playerDetail } from "../src/database/matchWriter"

describe.only("AppWrite", () => {
  it.skip("saves a match", async () => {
    const matchId = await createMatch(["p1", "p2"])
    expect(matchId).to.be.ok
  })

  it("can find player deatils.", async () => {
    expect(await playerDetail("0xe546b43E7fF912FEf7ED75D69c1d1319595F6080")).to.be.ok
  })

})