import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { loadFixture } from "ethereum-waffle";
import { ethers } from "hardhat";
import { Player } from "../typechain";
import { deployForwarderAndRoller } from "./fixtures";

describe("Player", function () {
  let player:Player
  let alice:SignerWithAddress

  beforeEach(async () => {
    const { forwarder } = await loadFixture(deployForwarderAndRoller)

    const Player = await ethers.getContractFactory("Player");
    player = await Player.deploy(forwarder.address);
    await player.deployed();
    alice = (await ethers.getSigners())[1]
    player = player.connect(alice)
  })

  it("sets username", async () => {
    await player.setUsername('alice');
    expect(await player.name(alice.address)).to.eq('alice')
  });

  it('sets team', async () => {
    await expect(player.setTeam(13)).to.not.be.reverted
  })

});
