import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { loadFixture } from "ethereum-waffle";
import { utils, Wallet } from "ethers";
import { keccak256 } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { Lobby, Player } from "../typechain";
import { deployForwarderAndRoller } from "./fixtures";

describe("Lobby", function () {
  let lobby:Lobby
  let player:Player
  let signers:SignerWithAddress[]

  beforeEach(async () => {
    signers = await ethers.getSigners()
    const deployer = signers[0]

    const { forwarder } = await loadFixture(deployForwarderAndRoller)

    const PlayerFactory = await ethers.getContractFactory('Player');
    player = await PlayerFactory.deploy(forwarder.address)
    await player.deployed()
    await player.setUsername('deployer');

    const LobbyFactory = await ethers.getContractFactory("Lobby");
    lobby = await LobbyFactory.deploy(forwarder.address, deployer.address);
    await lobby.deployed();
  })

  it("registers interest", async () => {
    const alice = signers[1]
    await expect(lobby.connect(alice).registerInterest()).to.not.be.reverted
    expect(await lobby.waitingAddresses()).to.have.members([alice.address])
  });

  it('can take addresses to play', async () => {
    const alice = signers[1]
    await lobby.connect(alice).registerInterest()
    await expect(lobby.takeAddresses([alice.address], keccak256(Buffer.from('this would be table id')))).to.not.be.reverted
    expect(await lobby.waitingAddresses()).to.have.lengthOf(0)
  })
});
