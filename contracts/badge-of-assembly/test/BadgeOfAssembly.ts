import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import {
  BadgeOfAssembly,
  BadgeOfAssembly__factory,
  MetadataPrinter__factory,
} from "../typechain";
import { getBadgeOfAssemblyContract } from "../tasks/helpers";

const preface = "data:application/json;base64,";

function rawMetaToObject(rawMetadataUri: string) {
  return JSON.parse(
    Buffer.from(rawMetadataUri.replace(preface, ""), "base64").toString()
  );
}

describe("BadgeOfAssembly", function () {
  let deployer: SignerWithAddress;
  let alice: SignerWithAddress;
  let boa: BadgeOfAssembly;

  const metadata = {
    name: "test",
    description: "",
    image: "https://test",
    animationUrl: "test",
    youtubeUrl: "test",
    maxPerWallet: BigNumber.from(1),
  };

  before(async () => {
    const accts = await ethers.getSigners();
    deployer = accts[0];
    alice = accts[1];

    const MetadataPrinterFactory = new MetadataPrinter__factory(deployer);
    const metadataPrinter = await MetadataPrinterFactory.deploy();
    await metadataPrinter.deployed();
    const BadgeOfAssemblyFactory = new BadgeOfAssembly__factory(deployer);
    boa = await BadgeOfAssemblyFactory.deploy(metadataPrinter.address, deployer.address);
    await boa.deployed();
    await boa.setup(metadata, 1);
  });

  it("creates", async () => {
    const rawMetadataUri: string = await boa.uri(1);
    const metadata = rawMetaToObject(rawMetadataUri);
    expect(metadata.name).to.equal("test");
  });

  it("enumerates a users tokens", async () => {
    expect(await boa.userTokens(deployer.address)).to.have.lengthOf(1);
  });

  it("updates metadata", async () => {
    await boa.updateMetadata(1, {
      ...metadata,
      name: "new name",
    });
    const newMeta = rawMetaToObject(await boa.uri(1));
    expect(newMeta.name).to.equal("new name");
  });

  it("enforces max mints", async () => {
    await expect(boa.mint(alice.address, 1, 1)).to.not.be.reverted;
    await expect(boa.mint(alice.address, 1, 1)).to.be.reverted;
  });
});
