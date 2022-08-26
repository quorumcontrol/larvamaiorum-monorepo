import { expect } from "chai"
import { loadFixture } from "ethereum-waffle"
import { utils, Wallet } from "ethers"
import { ethers } from "hardhat"

describe.only("Ranker", function () {

  async function deployRanker() {
    const signers = await ethers.getSigners()
    const deployer = signers[0]
    const RankerFactory = await ethers.getContractFactory("Ranker")
        // we pretend the wootgump contract is the deployer here
    const ranker = await RankerFactory.deploy(deployer.address)
    await ranker.deployed()
    return { ranker, deployer }
  }

  it('does not let the non-wootgump address queue', async () => {
    const { ranker } = await loadFixture(deployRanker)

    const signers = await ethers.getSigners()
    const eve = signers[1]

    const rando = Wallet.createRandom()
    await expect(ranker.connect(eve).queueRanking(rando.address, utils.parseEther('100'))).to.be.reverted
  })

  describe("[end-to-end]", async () => {
    it("queues rankings and clears rank queues", async () => {
      const { ranker } = await loadFixture(deployRanker)
      const addrs: string[] = []
      for (let i = 0; i < 5; i++) {
        const rando = Wallet.createRandom()
        addrs.unshift(rando.address)
        await expect(ranker.queueRanking(rando.address, utils.parseEther((i+1).toString()))).to.not.be.reverted
      }
      const unranked = await ranker.pendingRankings(0)
      expect(unranked).to.have.members(addrs)

      console.log('clear ranking now')
      const tx = ranker.clearRankingQueue(5, { gasLimit: 15_000_000})
      await expect(tx).to.not.be.reverted
      const receipt = await (await tx).wait()
      // console.log('gas: ', receipt.gasUsed)
      const ranked = await ranker.ranked(0)
  
      // console.log('addrs: ', addrs)
      // console.log('ranked: ', ranked)
  
      expect(ranked).to.have.lengthOf(5)
  
      expect(ranked[0]).to.equal(addrs[0])
      expect(ranked[1]).to.equal(addrs[1])
      expect(ranked[2]).to.equal(addrs[2])
      expect(ranked[3]).to.equal(addrs[3])
      expect(ranked[4]).to.equal(addrs[4])
  
    }).timeout(120000)
  })


})
