import "@nomiclabs/hardhat-ethers";
import { providers, Wallet } from "ethers";
import { task } from "hardhat/config";
import { BadgeOfAssembly__factory } from "../typechain";
import { getBadgeOfAssemblyContract } from "./helpers";

task('catchup-testnet').setAction(async (_, hre) => {
  const skaleMainnetProvider = new providers.StaticJsonRpcProvider('https://mainnet.skalenodes.com/v1/haunting-devoted-deneb')
  const testnetContract = await getBadgeOfAssemblyContract(hre);
  const mainnetContract = BadgeOfAssembly__factory.connect('0x2C6FD25071Fd516947682f710f6e9F5eD610207F', skaleMainnetProvider)
  let tokenId = 1;
  let metadata = await mainnetContract.metadata(tokenId);
  const accts = await hre.getNamedAccounts();
  const minter = accts.badgeMinter;
  if (!minter) {
    throw new Error("no minter")
  }
  while (metadata.name !== "") {
    const testnetMeta = await testnetContract.metadata(tokenId);
    if (testnetMeta.name !== metadata.name) {
      console.log("minting ", metadata.name, " token id: ", tokenId);
      await testnetContract.setup(metadata, 1);
      await testnetContract.setMinterAccess(tokenId, minter, true);
    }
    tokenId++;
    metadata = await mainnetContract.metadata(tokenId);
  }
});

task('approve-testnets').setAction(async (_, hre) => {
  const testnetContract = await getBadgeOfAssemblyContract(hre);
  const accts = await hre.getNamedAccounts();
  const minter = accts.badgeMinter;
  if (!minter) {
    throw new Error('no minter')
  }
  let tokenId = 1;
  let metadata = await testnetContract.metadata(tokenId);
  while (metadata.name !== "") {
    console.log('approving: ', tokenId)
    await testnetContract.setMinterAccess(tokenId, minter, true);
    tokenId++;
    metadata = await testnetContract.metadata(tokenId);
  }
});

task("gleam")
  .addParam("path", "the path to the wallets, expects a typescript file exporting { wallets }")
  .setAction(async ({ path }, hre) => {
    if (!process.env.GLEAM_MINTER) {
      throw new Error('must have the gleam minter key')
    }
    const { wallets }: { wallets: string[] } = await import(path)
    const gleamPrinter = new Wallet(
      process.env.GLEAM_MINTER,
      hre.ethers.provider
    );
    const boa = (await getBadgeOfAssemblyContract(hre)).connect(gleamPrinter);
    const TOKEN_ID = 7
    for (let i = 0; i < wallets.length; i++) {
      const address = wallets[i];
      try {
        console.log("minting to: ", address)
        const tx = await boa.mint(address, TOKEN_ID, 1, { gasLimit: 500_000 })
        await tx.wait()
        console.log("done. ", tx.hash)
      } catch (err) {
        // get the balance
        const bal = await boa.balanceOf(address, TOKEN_ID)
        if (bal.gt(0)) {
          console.log('err on trans, but no problem - already minted')
          continue
        }
        throw err
      }
    }
  });

task("setup")
  .addParam("name", "name of the badge")
  .addParam("description")
  .addParam("image")
  .addOptionalParam("animationUrl")
  .addOptionalParam("youtubeUrl")
  .addOptionalParam("maxPerWallet")
  .setAction(
    async (
      { name, description, image, animationUrl, youtubeUrl, maxPerWallet },
      hre
    ) => {
      const boa = await getBadgeOfAssemblyContract(hre);
      const tx = await boa.setup(
        {
          name,
          description,
          image,
          animationUrl: animationUrl || "",
          youtubeUrl: youtubeUrl || "",
          maxPerWallet: maxPerWallet || 0,
        },
        1
      );
      console.log("tx id: ", tx.hash);
      const receipt = await tx.wait();
      console.log(receipt);
    }
  );

task("mint", "mint existing badges to new users")
  .addParam("id", "the token id of the badge")
  .addParam("to", "address to send")
  .addOptionalParam("amount", "number of tokens")
  .setAction(async ({ id, to, amount }, hre) => {
    const boa = await getBadgeOfAssemblyContract(hre);
    const tx = await boa.mint(to, id, amount || 1);
    console.log("tx id: ", tx.hash);
    const receipt = await tx.wait();
    console.log(receipt);
  });

task("metadata")
  .addParam("tokenId", "the id to fetch for metadata")
  .setAction(async ({ tokenId }, hre) => {
    const boa = await getBadgeOfAssemblyContract(hre);
    const meta = await boa.metadata(tokenId);
    console.log(meta);
  });
