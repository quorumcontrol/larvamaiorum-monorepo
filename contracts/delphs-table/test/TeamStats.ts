import { expect } from "chai"
import { BigNumber } from 'ethers'
import { keccak256 } from "ethers/lib/utils";
import { loadFixture } from "ethereum-waffle"
import { ethers } from "hardhat"
import { deployForwarderAndRoller } from "./fixtures"

describe.only("TeamStats", function () {
  async function getDeployer() {
    const signers = await ethers.getSigners()
    return { deployer: signers[0], signers }
  }

  async function deployTeamStats() {
    const { deployer, signers } = await loadFixture(getDeployer)
    const { forwarder } = await loadFixture(deployForwarderAndRoller)

    const TeamStatsFactory = await ethers.getContractFactory("TeamStats")
    const teamStats = await TeamStatsFactory.deploy(
      forwarder.address,
      deployer.address
    )
    await teamStats.deployed()

    return { teamStats, deployer, alice: signers[1] }
  }

  it('emits', async () => {
    const { teamStats, deployer, alice } = await loadFixture(deployTeamStats)
    await expect(teamStats.register([{player: alice.address, value: BigNumber.from(1), tableId: keccak256(Buffer.from('test')), team: BigNumber.from(1) }])).to.emit(teamStats, 'TeamWin')
  })

})
