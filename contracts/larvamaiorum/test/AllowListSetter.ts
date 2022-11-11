import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { AllowListSetter__factory, ERC20__factory, IERC20__factory, TestToken__factory } from "../typechain-types";

const { constants, utils } = ethers

const ONE = utils.parseEther('1')

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

  it('doesnt let it happen for free', async () => {
    const { allowListSetter, alice } = await loadFixture(deployAllowListSetter)
    await expect(allowListSetter.connect(alice).buy(alice.address)).to.be.revertedWith('ERC20: insufficient allowance')
  })

  describe('on live testnet', () => {
    const wootgumpAddress = "0x8D1E200a2C572f9738f26554AAcbC2F9a462EF2D"
    const delphAddress = '0x6DE3D3747D54d0Adc11e5Cf678D4045B0441D332'
    const meAddr = '0xe546b43E7fF912FEf7ED75D69c1d1319595F6080'

    async function deployOnTestnet() {
      await network.provider.request({
        method: "hardhat_reset",
        params: [
          {
            forking: {
              jsonRpcUrl: "https://staging-v2.skalenodes.com/v1/roasted-thankful-unukalhai",
              blockNumber: 1042663,
            },
          },
        ],
      });

      const [,alice] = await ethers.getSigners()

      const delph = await ethers.getImpersonatedSigner(delphAddress)
      const me = await ethers.getImpersonatedSigner(meAddr)

      const wootgump = TestToken__factory.connect(wootgumpAddress, delph) // testtoken has mint which we need and also the normal erc20
      const allowListSetter = AllowListSetter__factory.connect("0x5FbDB2315678afecb367f032d93F642f64180aa3", me)

      // const AllowListSetter = await ethers.getContractFactory("AllowListSetter");
      // expect(AllowListSetter.bytecode.length).to.be.lessThanOrEqual(25 * 1024)
      // const allowListSetter = (await AllowListSetter.deploy(constants.AddressZero, wootgump.address, delph.address)).connect(delph)
      // await expect(allowListSetter.setCurrentPrice(ONE)).to.not.be.reverted
      // await expect(allowListSetter.addSupply(1)).to.not.be.reverted

      return { delph, wootgump, alice, allowListSetter, me }
    }

    it('works', async () => {
      const { wootgump, alice, allowListSetter, me } = await loadFixture(deployOnTestnet)
      await expect(alice.sendTransaction({to: me.address, value: ONE.mul(10)})).to.not.be.reverted
      // await expect(wootgump.connect(me).approve(allowListSetter.address, ONE.mul(2))).to.not.be.reverted
      // await expect(wootgump.mint(alice.address, ONE.mul(15000))).to.not.be.reverted
      // await expect(wootgump.connect(alice).approve(allowListSetter.address, ONE.mul(2000))).to.not.be.reverted
      await expect(allowListSetter.connect(me).buy(me.address)).to.not.be.reverted
    })
  })
});
