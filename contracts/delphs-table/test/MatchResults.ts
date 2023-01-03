import { expect } from "chai"
import { loadFixture } from "ethereum-waffle"
import { keccak256 } from "ethers/lib/utils"
import { ethers } from "hardhat"
import { deployForwarderAndRoller } from "./fixtures"

describe("MatchResults", function () {
  async function getDeployer() {
    const signers = await ethers.getSigners()
    return { deployer: signers[0], signers }
  }

  async function deployMatchResults() {
    const { deployer } = await loadFixture(getDeployer)
    const { forwarder } = await loadFixture(deployForwarderAndRoller)

    const MatchResultsFactory = await ethers.getContractFactory("MatchResults")
    const matchResults = await MatchResultsFactory.deploy(
      forwarder.address,
      deployer.address
    )
    await matchResults.deployed()

    return { matchResults }
  }

  it.only("records match results", async () => {
    const { matchResults } = await loadFixture(deployMatchResults)
    const id = keccak256(Buffer.from("testmatch"))
    await matchResults.registerResults(id, "winner")
    expect(await matchResults.winners(id)).to.equal("winner")
  })
})
