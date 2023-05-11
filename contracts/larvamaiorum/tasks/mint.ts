import { task } from 'hardhat/config'
import { getLarvaMaiorum, getMinervaReadings } from './helpers'

task('mint')
  .addParam('to', 'the address to send the token')
  .addOptionalParam('amount', 'amount to mint, defaults to 1')
  .setAction(async ({to, amount:userAmount}, hre) => {
      const amount = userAmount || 1
      const larvaMaiorum = await getLarvaMaiorum(hre)

      for (let i = 0; i < amount; i++) {
        const tx = await larvaMaiorum.mint(to)
        console.log('tx: ', tx.hash)
        await tx.wait()
      }

      console.log('done, minted: ', amount)
  })

task("minerva:new-minter", "add the minter role to a wallet on MinervaReadings")
  .addParam("minter", "the address of the new minter")
  .setAction(async ({minter}, hre) => {
    const minervaReadings = await getMinervaReadings(hre)
    const tx = await minervaReadings.grantRole(
      await minervaReadings.MINTER_ROLE(),
      minter,
    )
    console.log("tx", tx.hash)
    await tx.wait()
    console.log("done")
  })