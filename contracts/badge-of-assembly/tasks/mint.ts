import "@nomiclabs/hardhat-ethers";
import { constants, utils, Wallet } from "ethers";
import { task } from "hardhat/config";
import { getBadgeOfAssemblyContract } from "./helpers";

// task("gleam")
//   .setAction(async (_, hre) => {
//     const gleamPrinter = new Wallet(process.env.GLEAM_MINTER, hre.ethers.provider)
//     const boa = (await getBadgeOfAssemblyContract(hre)).connect(gleamPrinter);

//     const TOKEN_ID = 7

//     for (let i = 0; i < wallets.length; i++) {
//       console.log("minting to: ", wallets[i])
//       const tx = await boa.mint(wallets[i], TOKEN_ID, 1, { gasLimit: 500_000})
//       await tx.wait()
//       console.log("done. ", tx.hash)
//     }
//   })

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
