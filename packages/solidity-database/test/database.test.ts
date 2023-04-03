import { expect } from "chai"
import { ethers } from "ethers"
import Database from "../src/database"

describe("Database", () => {
  it("should be able to be constructed", () => {
    const signer = ethers.Wallet.createRandom()
    const database = new Database(signer)
    expect(database).to.be.ok
  })
})