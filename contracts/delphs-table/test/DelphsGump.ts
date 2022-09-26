import { expect } from "chai"
import { loadFixture } from "ethereum-waffle"
import { utils } from "ethers"
import { ethers } from "hardhat"
import { mine } from "@nomicfoundation/hardhat-network-helpers"
import { deployForwarderAndRoller } from "./fixtures"

describe("DelphsGump", function () {
  async function getDeployer() {
    const signers = await ethers.getSigners()
    return { deployer: signers[0], signers }
  }

  async function deployDelphsGump() {
    const { deployer, signers } = await loadFixture(getDeployer)
    const { forwarder } = await loadFixture(deployForwarderAndRoller)

    const WootgumpFactory = await ethers.getContractFactory("Wootgump")
    const wootgump = await WootgumpFactory.deploy(
      forwarder.address,
      deployer.address
    )
    await wootgump.deployed()

    const RankerFactory = await ethers.getContractFactory("Ranker")
    const ranker = await RankerFactory.deploy(wootgump.address)
    await ranker.deployed()
    await wootgump.setRanker(ranker.address)

    const DelphsGumpFactory = await ethers.getContractFactory("DelphsGump")
    const delphsGump = await DelphsGumpFactory.deploy(forwarder.address, wootgump.address, deployer.address)

    return { wootgump, delphsGump, deployer, signers }
  }

  it("vests", async () => {
    const { delphsGump, wootgump, signers } = await loadFixture(deployDelphsGump)
    const alice = signers[1]
    await wootgump.grantRole(
      "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6",
      delphsGump.address
    )
    await delphsGump.mint(alice.address, utils.parseEther("1"))
    await mine((24 * 60 * 60 * 2) / 4) // about 2 days of blocks
    await delphsGump.vest(alice.address)
    // const receipt = await tx.wait()
    let newBalance = utils.formatEther(await delphsGump.balanceOf(alice.address))
    expect(parseFloat(newBalance)).to.be.within(0.45, 0.55)
    // now let's go another 3 days
    await mine((24 * 60 * 60 * 3) / 4)
    await delphsGump.vest(alice.address)
    newBalance = utils.formatEther(await delphsGump.balanceOf(alice.address))
    expect(parseFloat(newBalance)).to.equal(0)
  })
})
