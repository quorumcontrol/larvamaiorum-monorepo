import "@nomiclabs/hardhat-ethers";
import { Wallet } from "ethers";
import { task } from "hardhat/config";
import { getBadgeOfAssemblyContract } from "./helpers";

task("gleam")
  .addParam("path", "the path to the wallets, expects a typescript file exporting { wallets }")
  .setAction(async ({ path }, hre) => {
    if (!process.env.GLEAM_MINTER) {
      throw new Error('must have the gleam minter key')
    }
    const { wallets }:{wallets: string[]} = await import(path)
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
    const meta = await boa.uri(tokenId);
    console.log(meta);
  });
