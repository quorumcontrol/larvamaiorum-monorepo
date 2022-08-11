import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { loadFixture } from "ethereum-waffle";
import { ethers } from "hardhat";
import { Player } from "../typechain";
import { deployForwarderAndRoller } from "./fixtures";
import { createToken } from 'skale-relayer-contracts'

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

  it('sets through the forwarder', async () => {
    const { forwarder } = await loadFixture(deployForwarderAndRoller)
    const relayer = (await ethers.getSigners())[1]
    const token = await createToken(forwarder, alice, relayer)

    const populated = await player.populateTransaction.setUsername('relayedAlice')
    await expect(forwarder.connect(relayer).execute({
      issuedAt: token.issuedAt,
      to: populated.to!,
      from: alice.address,
      data: populated.data!,
      gas: 1_000_000,
      value: 0,
    }, token.signature)).to.not.be.reverted

    expect(await player.name(alice.address)).to.eq('relayedAlice')
  })

});
