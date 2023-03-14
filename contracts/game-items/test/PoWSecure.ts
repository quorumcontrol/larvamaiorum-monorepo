import { expect } from "chai"
import { ethers } from "hardhat"

describe("PoWSecure", () => {

    it("deploys a small enough contract", async () => {
        const deployer = (await ethers.getSigners())[0]
        const fact = await ethers.getContractFactory("PoWSecure")
        expect(Buffer.from(fact.bytecode.slice(2), "hex").byteLength).to.be.lessThan(24576)
        const faucet = await fact.deploy(deployer.address)
        await faucet.deployed()
    })

})