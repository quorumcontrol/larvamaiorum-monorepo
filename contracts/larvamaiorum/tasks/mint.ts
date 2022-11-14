import { task } from 'hardhat/config'
import { BigNumber } from 'ethers'
import { getLarvaMaiorum } from './helpers'

task('mint')
  .addParam('to', 'the address to send the token')
  .setAction(async ({to}, hre) => {
      const larvaMaiorum = await getLarvaMaiorum(hre)

      const tx = await larvaMaiorum.mint(to)
      console.log('tx: ', tx.hash)
      await tx.wait()
      console.log('done')
  })
