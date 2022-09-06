import { expect } from "chai"
import { BigNumber } from 'ethers'
import { loadFixture } from "ethereum-waffle"
import { ethers } from "hardhat"
import { deployForwarderAndRoller } from "./fixtures"

describe("Accolades", function () {
  async function getDeployer() {
    const signers = await ethers.getSigners()
    return { deployer: signers[0], signers }
  }

  async function deployAccolades() {
    const { deployer, signers } = await loadFixture(getDeployer)
    const { forwarder } = await loadFixture(deployForwarderAndRoller)

    const AccoladesFactory = await ethers.getContractFactory("Accolades")
    const accolades = await AccoladesFactory.deploy(
      forwarder.address,
      deployer.address
    )
    await accolades.deployed()

    return { accolades, deployer, alice: signers[1] }
  }

  it('keeps track of user tokens', async () => {
    const { accolades, deployer, alice } = await loadFixture(deployAccolades)
    await accolades.mint(alice.address, 0, 1, [])
    expect((await accolades.userTokens(alice.address)).map((bn) => bn.toString())).to.have.members(['0'])
    await accolades.connect(alice).safeTransferFrom(alice.address, deployer.address, 0, 1, [])
    expect((await accolades.userTokens(deployer.address)).map((bn) => bn.toString())).to.have.members(['0'])
    expect(await accolades.userTokens(alice.address)).to.have.lengthOf(0)
  })

})
