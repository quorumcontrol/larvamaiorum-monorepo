import { loadFixture } from 'ethereum-waffle';
import { ethers } from 'hardhat'
import { Noncer__factory, TrustedForwarder__factory } from 'skale-relayer-contracts/lib/typechain-types'

const SERVICE = "delphstable.tester";
const STATEMENT = "I am but a test user";
const URI = "https://localhost:3000";
const VERSION = "1";

export async function deployDiceRoller() {
  const DiceRollerFactory = await ethers.getContractFactory("TestDiceRoller");
  const diceRoller = await DiceRollerFactory.deploy();
  return diceRoller
}

export async function deployForwarderAndRoller() {
  const diceRoller = await loadFixture(deployDiceRoller)
  const signers = await ethers.getSigners()

  const noncer = await new Noncer__factory(signers[0]).deploy(diceRoller.address)

  const forwarder = await new TrustedForwarder__factory(signers[0]).deploy(noncer.address, SERVICE, STATEMENT, URI, VERSION)
  
  return { forwarder, diceRoller }
}