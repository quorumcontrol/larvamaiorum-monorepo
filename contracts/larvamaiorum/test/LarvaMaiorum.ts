import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

const { constants } = ethers

describe("LarvaMaiorum", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployLarvaMaiorum() {
    // Contracts are deployed using the first signer/account by default
    const [deployer, alice] = await ethers.getSigners();

    const LarvaMaiorum = await ethers.getContractFactory("LarvaMaiorum");
    expect(LarvaMaiorum.bytecode.length).to.be.lessThanOrEqual(25 * 1024)
    const larvaMaiorum = await LarvaMaiorum.deploy("Crypto Colosseum: Larva Maiorum", "CCLM");

    return { larvaMaiorum, deployer, alice };
  }

  it('deploys', async () => {
    const { larvaMaiorum } = await loadFixture(deployLarvaMaiorum)
    expect(larvaMaiorum.address).to.not.equal(constants.AddressZero)
  })

  describe('minting', () => {
    const tokenBaseUri = "https://localhost:3000/larvamaiorum-metadata/"
    async function mintOneToAlice() {
      const { larvaMaiorum, alice } = await loadFixture(deployLarvaMaiorum)
      await larvaMaiorum.setMaxSupply(1)
      await larvaMaiorum.addMetadataUri(tokenBaseUri)
      await larvaMaiorum.setCurrentlyMinting(0)
      await expect(larvaMaiorum.mint(alice.address)).to.not.be.reverted
      return { larvaMaiorum, alice }
    }

    describe("allow list minting", () => {
      async function allowListAdded() {
        const { larvaMaiorum, alice } = await loadFixture(mintOneToAlice)
        await larvaMaiorum.setMaxSupply(10)
        await expect(larvaMaiorum.addToAllowList(alice.address, 1)).to.not.be.reverted
        return { larvaMaiorum, alice }
      }

      it("mints from the allow list", async () => {
        const { larvaMaiorum, alice } = await loadFixture(allowListAdded)
        await expect(larvaMaiorum.connect(alice).mintFromAllowList(alice.address)).to.not.be.reverted
      })

      it('only mints the allowed amount', async () => {
        const { larvaMaiorum, alice } = await loadFixture(allowListAdded)
        await expect(larvaMaiorum.connect(alice).mintFromAllowList(alice.address)).to.not.be.reverted
        await expect(larvaMaiorum.connect(alice).mintFromAllowList(alice.address)).to.be.revertedWith("LM: not on list")
      })
    })


    describe("minting one", () => {
      it('mints to the max supply', async () => {
        const { larvaMaiorum, alice } = await loadFixture(mintOneToAlice)
        // the next one is bigger than the supply so we expect it to revert
        await expect(larvaMaiorum.mint(alice.address)).to.be.reverted
      })

      it("has the right metadata", async () => {
        const { larvaMaiorum } = await loadFixture(mintOneToAlice)
        // the next one is bigger than the supply so we expect it to revert
        expect(await larvaMaiorum.tokenURI(0)).to.equal(`${tokenBaseUri}0.json`)
      })
    })

    describe('adjusting metadata', () => {
      const differentBaseUri = "https://different/"

      async function setupDifferentMetadata() {
        const { larvaMaiorum, alice } = await loadFixture(mintOneToAlice)

        await larvaMaiorum.setMaxSupply(10)
        await larvaMaiorum.addMetadataUri(differentBaseUri)
        return { larvaMaiorum, alice }
      }

      it('still mints on old metadata until adjusted', async () => {
        const { larvaMaiorum, alice } = await loadFixture(setupDifferentMetadata)

        await expect(larvaMaiorum.mint(alice.address)).to.not.be.reverted
        expect(await larvaMaiorum.tokenURI(1)).to.equal(`${tokenBaseUri}1.json`)
      })

      it('adjusts metadata when set', async () => {
        const { larvaMaiorum, alice } = await loadFixture(setupDifferentMetadata)
        await larvaMaiorum.setCurrentlyMinting(1)
        await expect(larvaMaiorum.mint(alice.address)).to.not.be.reverted
        expect(await larvaMaiorum.tokenURI(1)).to.equal(`${differentBaseUri}1.json`)
      })

      it("bulk adjusts metadata", async () => {
        const { larvaMaiorum, alice } = await loadFixture(setupDifferentMetadata)
        for (let i = 0; i < 5; i++) {
          await expect(larvaMaiorum.mint(alice.address)).to.not.be.reverted
        }
        await expect(larvaMaiorum.bulkUpdateMetadata(1, 4, 1)).to.not.be.reverted
        for (let i = 1; i < 5; i++) {
          expect(await larvaMaiorum.tokenURI(i)).to.equal(`${differentBaseUri}${i}.json`)
        }
        // however the *last* one should not have updated (make sure to not get off by one errors)
        expect(await larvaMaiorum.tokenURI(5)).to.equal(`${tokenBaseUri}5.json`)
      })
    })
  })
});
