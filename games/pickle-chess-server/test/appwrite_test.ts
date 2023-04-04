import { expect } from 'chai'
import { createMatch, playerWins } from "../src/database/matchWriter"

describe.only("AppWrite", () => {
  it.skip("saves a match", async () => {
    const matchId = await createMatch(["p1", "p2"])
    expect(matchId).to.be.ok
  })

  it("can find matches by player", async () => {
    expect(await playerWins("0xe546b43E7fF912FEf7ED75D69c1d1319595F6080")).to.equal(1)
  })

})