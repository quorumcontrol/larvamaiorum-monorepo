import { expect } from "chai"
import { loadFixture } from "ethereum-waffle"
import { utils, Wallet } from "ethers"
import { ethers } from "hardhat"
import { Wootgump } from "../typechain"
import { deployForwarderAndRoller } from "./fixtures"

describe.only("Wootgump", function () {
  async function getDeployer() {
    const signers = await ethers.getSigners()
    return { deployer: signers[0], signers }
  }

  async function demoBuildLeaderboard(wootgump:Wootgump) {
    const vals = await wootgump.rankedValues(2)
    const addrs = await Promise.all(
      vals.map((v) => {
        return wootgump.addressesForValue(v)
      })
    )
    return addrs.flat()
  }

  async function deployWootgump() {
    const { deployer } = await loadFixture(getDeployer)
    const { forwarder } = await loadFixture(deployForwarderAndRoller)
    const WootgumpFactory = await ethers.getContractFactory("Wootgump")
    const wootgump = await WootgumpFactory.deploy(
      forwarder.address,
      deployer.address
    )
    await wootgump.deployed()
    expect(Buffer.from(WootgumpFactory.bytecode.slice(2, -1)).length).to.be.lte(26_000)
    return { wootgump }
  }

  it("ranks", async () => {
    const { signers } = await getDeployer()
    const { wootgump } = await loadFixture(deployWootgump)
    await wootgump.mint(signers[1].address, utils.parseEther("1"))
    await wootgump.mint(signers[2].address, utils.parseEther("2"))
    const vals = await wootgump.rankedValues(2)
    expect(vals.map((v) => v.toString())).to.have.members([
      utils.parseEther("1").toString(),
      utils.parseEther("2").toString(),
    ])

    const leaderboard = await demoBuildLeaderboard(wootgump)
    expect(leaderboard[0]).to.equal(signers[2].address)
    expect(leaderboard[1]).to.equal(signers[1].address)
  })

  it("ranks 10000", async () => {
    const { wootgump } = await loadFixture(deployWootgump)
    const windowSize = 100
    for (let i = 0; i < 700; i += windowSize) {
      const mints = new Array(windowSize).fill(true).map((_, j) => {
        const random = Wallet.createRandom()
        return {
          to: random.address,
          amount: utils.parseEther((i + j).toString()),
        }
      })
      console.log("minting: ", i)
      await (await wootgump.bulkMint(mints)).wait()
    }
  }).timeout(120000)
})
