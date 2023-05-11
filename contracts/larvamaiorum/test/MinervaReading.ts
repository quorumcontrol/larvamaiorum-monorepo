import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

const { constants } = ethers;

describe("MinervaReading", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployMinervaReadings() {
    // Contracts are deployed using the first signer/account by default
    const [deployer, alice] = await ethers.getSigners();

    const MinervaReading = await ethers.getContractFactory("MinervaReadings");
    expect(MinervaReading.bytecode.length).to.be.lessThanOrEqual(25 * 1024);
    const minervaReading = await MinervaReading.deploy(deployer.address);

    return { minervaReading, deployer, alice };
  }

  it("deploys", async () => {
    const { minervaReading } = await loadFixture(deployMinervaReadings);
    expect(minervaReading.address).to.not.equal(constants.AddressZero);
  });

  it("burns", async () => {
    const { minervaReading, alice } = await loadFixture(deployMinervaReadings);
    await expect(minervaReading.safeMint(alice.address, "https://nowhere")).to.not.be.reverted;
    await expect(minervaReading.adminBurn(0)).to.not.be.reverted;
  })

  it("sets the contractURI", async () => {
    const { minervaReading } = await loadFixture(deployMinervaReadings);
    await expect(
      minervaReading.setContractURI(
        "https://localhost:3000/contract-metadata/",
      ),
    ).to.not.be.reverted;
    expect(await minervaReading.contractURI()).to.equal(
      "https://localhost:3000/contract-metadata/",
    );
  });
});
