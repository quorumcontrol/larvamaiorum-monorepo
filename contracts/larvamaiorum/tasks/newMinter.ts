import { task } from 'hardhat/config'
import { utils } from 'ethers'
import { getDeployer, getMinervaReadings } from './helpers'

task('create-minter', "creates a new random wallet and returns the private key and the address")
  .setAction(async (_, hre) => {
    const wallet = hre.ethers.Wallet.createRandom()

    console.log('address: ', wallet.address, 'private key: ', wallet.privateKey)
  })


task("balance", "prints the balance of an address")
  .addParam("address", "the address to check")
  .setAction(async ({address}, hre) => {
    const balance = await hre.ethers.provider.getBalance(address)
    console.log('balance: ', utils.formatEther(balance))
  })

task("fund", "sends 1 sfuel to an address")
  .addParam("address", "the address to fund")
  .setAction(async ({address}, hre) => {
    const deployer = await getDeployer(hre)
    const tx = await deployer.sendTransaction({
      to: address,
      value: utils.parseEther("1"),
    })
    console.log("tx", tx.hash)
    await tx.wait()
    console.log("done")
  })

task("minerva:burn", "burn a token as an admin")
  .addParam("token", "the token id")
  .setAction(async ({url, token}, hre) => {
    const minervaReadings = await getMinervaReadings(hre)
    const tx = await minervaReadings.adminBurn(
      token,
    )
    console.log("tx", tx.hash)
    await tx.wait()
    console.log("done")
  })