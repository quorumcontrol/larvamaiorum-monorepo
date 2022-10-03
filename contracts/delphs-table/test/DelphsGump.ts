import { expect } from "chai"
import { loadFixture } from "ethereum-waffle"
import { utils } from "ethers"
import { ethers, network } from "hardhat"
import { mine, impersonateAccount } from "@nomicfoundation/hardhat-network-helpers"
import { deployForwarderAndRoller } from "./fixtures"
import { DelphsGump__factory, Wootgump__factory } from "../typechain"

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

  // it.skip('works on testnet', async () => {
  //   await network.provider.request({
  //     method: "hardhat_reset",
  //     params: [
  //       {
  //         forking: {
  //           jsonRpcUrl: "https://staging-v2.skalenodes.com/v1/roasted-thankful-unukalhai",
  //         },
  //       },
  //     ],
  //   })

  //   await impersonateAccount('0x6DE3D3747D54d0Adc11e5Cf678D4045B0441D332');
  //   const delph = await ethers.getSigner('0x6DE3D3747D54d0Adc11e5Cf678D4045B0441D332')
  //   const wootgump = Wootgump__factory.connect('0x8D1E200a2C572f9738f26554AAcbC2F9a462EF2D', delph)
  //   const forwarderAddress = '0x7cC2757877Dc42F7216D3E8009cCB06f297BbAe7'

  //   const DelphsGumpFactory = await ethers.getContractFactory("DelphsGump")
  //   const delphsGump = await DelphsGumpFactory.deploy(forwarderAddress, wootgump.address, delph.address)
  //   await delphsGump.deployed()

  //   const minterRole = await wootgump.MINTER_ROLE()
  //   console.log("minter role: ", minterRole)
  //   await wootgump.connect(delph).grantRole(minterRole, delphsGump.address)
  //   const mints = [
  //     {
  //     to: '0x51e37c31F7F12cC3aeD5ABDedc755CbD18C0aF29',
  //     amount: '0x6124fee993bc0000',
  //   },
  //   {
  //     to: '0x53Cc2732c07FCeC250eA4E4820cAa77Eab995473',
  //     amount: '0x4563918244f40000'
  //   },
  //   {
  //     to: '0xAef2E4314fA27E2DeF57d7565F25dc56c10A2080',
  //     amount: '0x0de0b6b3a7640000',
  //   }
  // ]
  //   await expect(delphsGump.connect(delph).bulkMint(mints, { gasLimit: 8_000_000 })).to.be.revertedWith('booyah')
  // })

  it("vests with vest function", async () => {
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

  it.only("vests at mint", async () => {
    const { delphsGump, wootgump, signers } = await loadFixture(deployDelphsGump)
    const alice = signers[1]
    await wootgump.grantRole(
      "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6",
      delphsGump.address
    )
    await delphsGump.mint(alice.address, utils.parseEther("2"))
    await mine((24 * 60 * 60 * 5) / 4)
    await expect(delphsGump.mint(alice.address, 1)).to.not.be.reverted
    expect(await delphsGump.balanceOf(alice.address)).to.equal(1)
  })

  it("vests at burn", async () => {
    const { delphsGump, wootgump, signers } = await loadFixture(deployDelphsGump)
    const alice = signers[1]
    await wootgump.grantRole(
      "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6",
      delphsGump.address
    )
    await delphsGump.mint(alice.address, utils.parseEther("1"))
    // move 5 days into the future
    await mine((24 * 60 * 60 * 5) / 4)
    await expect(delphsGump["burn(address,uint256)"](alice.address, 1)).to.not.be.reverted
    expect(await delphsGump.balanceOf(alice.address)).to.equal(0)
  })

  it('bulk mints', async () => {
    const { delphsGump, wootgump, signers } = await loadFixture(deployDelphsGump)

    const mints = [{
      to: '0x51e37c31F7F12cC3aeD5ABDedc755CbD18C0aF29',
      amount: '0x6124fee993bc0000',
    },
    {
      to: '0x53Cc2732c07FCeC250eA4E4820cAa77Eab995473',
      amount: '0x4563918244f40000'
    },
    {
      to: '0xAef2E4314fA27E2DeF57d7565F25dc56c10A2080',
      amount: '0x0de0b6b3a7640000',
    }]
    const tx = delphsGump.bulkMint(mints, { gasLimit: 8_000_000 })
   await expect(tx).to.not.be.reverted
    const receipt = (await tx).wait()
    console.log('gas: ', (await receipt).gasUsed)
  })
})
