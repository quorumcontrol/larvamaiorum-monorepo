import { expect } from "chai"
import { loadFixture } from "ethereum-waffle"
import { utils, Wallet } from "ethers"
import { ethers } from "hardhat"
import { Wootgump } from "../typechain"
import { deployForwarderAndRoller } from "./fixtures"

describe("Wootgump", function () {
  async function getDeployer() {
    const signers = await ethers.getSigners()
    return { deployer: signers[0], signers }
  }

  // async function demoBuildLeaderboard(wootgump:Wootgump) {
  //   const vals = await wootgump.rankedValues(2)
  //   const addrs = await Promise.all(
  //     vals.map((v) => {
  //       return wootgump.addressesForValue(v)
  //     })
  //   )
  //   return addrs.flat()
  // }

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

    const RankerFactory = await ethers.getContractFactory("Ranker")
    const ranker = await RankerFactory.deploy(wootgump.address)
    await ranker.deployed()
    await wootgump.setRanker(ranker.address)
    return { wootgump, ranker }
  }

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
      const receipt = await (await wootgump.bulkMint(mints)).wait()
      console.log("gas: ", receipt.gasUsed)
    }
  }).timeout(120000)
})
