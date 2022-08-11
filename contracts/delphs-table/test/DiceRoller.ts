import { expect } from "chai";
import { ethers } from "hardhat";
import { DiceRoller } from "../typechain";

describe("DiceRoller", function () {
  let diceRoller:DiceRoller

  beforeEach(async () => {
    const DiceRollerFactory = await ethers.getContractFactory("DiceRoller");
    diceRoller = await DiceRollerFactory.deploy();
    await diceRoller.deployed();
  })

  it("gets random", async () => {
    expect(await diceRoller.getRandom()).to.have.lengthOf(66) // this won't actually work on the hardhat network
  });
});
