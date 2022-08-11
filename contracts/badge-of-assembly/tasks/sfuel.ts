import "@nomiclabs/hardhat-ethers";
import { providers, Signer } from "ethers";
import { utils } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("fund")
  .addParam("to", "which account to fund")
  .addOptionalParam("amount", "amount of fuel to send")
  .setAction(async ({ to, amount }, hre) => {
    const signer = (await hre.ethers.getSigners())[0];
    const txParams: providers.TransactionRequest = {
      // from: signer.address,
      to: to,
      value: utils.parseEther(amount || "1000"),
    };
    const tx = await signer.sendTransaction(txParams);
    console.log("tx id: ", tx.hash);
    await tx.wait();
    const bal = await signer.getBalance();
    console.log("balance remaining: ", formatEther(bal));
  });

task("balance").setAction(async (_, hre) => {
  const signer = (await hre.ethers.getSigners())[0];
  const balance = await signer.getBalance();
  console.log("addr: ", await signer.getAddress());
  console.log("balance: ", utils.formatEther(balance));
});
