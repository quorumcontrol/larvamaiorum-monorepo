import { expect } from "chai"
import { loadFixture } from "ethereum-waffle"
import { keccak256 } from "ethers/lib/utils"
import { ethers } from "hardhat"
import { ListKeeper } from "../typechain"
import { deployForwarderAndRoller } from "./fixtures"

describe("ListKeeper", function () {
  async function getDeployer() {
    const signers = await ethers.getSigners()
    return { deployer: signers[0], signers }
  }

  async function deployListKeeper() {
    const { deployer } = await loadFixture(getDeployer)
    const { forwarder } = await loadFixture(deployForwarderAndRoller)

    const ListKeeperFactory = await ethers.getContractFactory("ListKeeper")
    const listKeeper = await ListKeeperFactory.deploy(
      forwarder.address,
      deployer.address
    )
    await listKeeper.deployed()

    return { listKeeper }
  }

  it("adds", async () => {
    const { listKeeper } = await loadFixture(deployListKeeper)
    const list = keccak256(Buffer.from('nftbadgeberlin'))
    const item = keccak256(Buffer.from('id:1234'))
    await expect(listKeeper.add(list, item)).to.not.be.reverted
    await expect(listKeeper.add(list, item)).to.be.reverted
    await expect(listKeeper.add(list, keccak256(Buffer.from('id:12345')))).to.not.be.reverted
  })

  it("supports maximum sizes", async () => {
    const { listKeeper } = await loadFixture(deployListKeeper)
    const list = keccak256(Buffer.from('sizedList'))
    await (await listKeeper.setMaxListSize(list, 3)).wait()
    for (let i = 0; i < 3; i++) {
      await expect(listKeeper.add(list, keccak256(Buffer.from(`id:${i}-fake`)))).to.not.be.reverted
    }
    await expect(listKeeper.add(list, keccak256(Buffer.from(`id:3-fake`)))).to.be.reverted
  })
})
