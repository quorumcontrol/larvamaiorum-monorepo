import { expect } from "chai"
import { ethers } from "hardhat"

describe("PlayerProfile", () => {

    it("deploys a small enough contract", async () => {
        const fact = await ethers.getContractFactory("PlayerProfile")
        expect(Buffer.from(fact.bytecode.slice(2), "hex").byteLength).to.be.lessThan(24576)
    })

})