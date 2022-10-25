import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

const { constants, utils } = ethers

const ONE = constants.One

describe("AllowListSetter", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployAllowListSetter() {
    // Contracts are deployed using the first signer/account by default
    const [deployer, alice] = await ethers.getSigners();

    const Wootgump = await ethers.getContractFactory("TestToken");
    const wootgump = await Wootgump.deploy()

    const AllowListSetter = await ethers.getContractFactory("AllowListSetter");
    expect(AllowListSetter.bytecode.length).to.be.lessThanOrEqual(25 * 1024)
    const allowListSetter = await AllowListSetter.deploy(constants.AddressZero, wootgump.address, deployer.address);
    await expect(allowListSetter.setCurrentPrice(ONE)).to.not.be.reverted
    await expect(allowListSetter.addSupply(1)).to.not.be.reverted

    return { allowListSetter, deployer, alice, wootgump };
  }

  it('deploys', async () => {
    const { allowListSetter } = await loadFixture(deployAllowListSetter)
    expect(allowListSetter.address).to.not.equal(constants.AddressZero)
  })

  it('allows users to buy', async () => {
    const { allowListSetter, alice, wootgump } = await loadFixture(deployAllowListSetter)
    await wootgump.mint(alice.address, ONE)
    await wootgump.connect(alice).approve(allowListSetter.address, ONE)
    await expect(allowListSetter.connect(alice).buy(alice.address)).to.not.be.reverted
    expect(await allowListSetter.balanceOf(alice.address)).to.equal(1)
  })



});
