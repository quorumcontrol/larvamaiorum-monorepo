import { expect } from "chai";
import { loadFixture } from "ethereum-waffle";
import { keccak256 } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { OrchestratorState } from "../typechain";
import { deployForwarderAndRoller } from "./fixtures";

describe("OrchestratorState", function () {
  let orchestrator:OrchestratorState

  const bytes32 = keccak256(Buffer.from('test'))

  beforeEach(async () => {
    const deployer = (await ethers.getSigners())[0]
    
    const { forwarder } = await loadFixture(deployForwarderAndRoller)

    const OrchestratorFactory = await ethers.getContractFactory("OrchestratorState");
    orchestrator = await OrchestratorFactory.deploy(forwarder.address, deployer.address);
    await orchestrator.deployed();
  })

  it("adds", async () => {
    await expect(orchestrator.add(bytes32)).to.not.be.reverted
    expect(await orchestrator.all()).to.have.lengthOf(1)
    expect(await orchestrator.all()).to.have.members([bytes32])
  });

  it('removes', async () => {
    await expect(orchestrator.add(bytes32)).to.not.be.reverted
    expect(await orchestrator.all()).to.have.lengthOf(1)
    await expect(orchestrator.remove(bytes32)).to.not.be.reverted
    expect(await orchestrator.all()).to.have.lengthOf(0)
  })

  it('bulk removes', async () => {
    const second = keccak256(Buffer.from('test2'))

    await expect(orchestrator.add(bytes32)).to.not.be.reverted
    await expect(orchestrator.add(second)).to.not.be.reverted
    expect(await orchestrator.all()).to.have.lengthOf(2)
    await expect(orchestrator.bulkRemove([bytes32, second])).to.not.be.reverted
    expect(await orchestrator.all()).to.have.lengthOf(0)
  })
});
