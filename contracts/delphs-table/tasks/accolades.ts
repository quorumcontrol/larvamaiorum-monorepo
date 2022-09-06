import "@nomiclabs/hardhat-ethers"
import { utils } from "ethers"
import { task } from 'hardhat/config'
import { getAccoladeContract } from './helpers'

task('mint-accolade')
  .addParam('to')
  .addParam('id')
  .setAction(async ({ to, id }, hre) => {
    const accolades = await getAccoladeContract(hre)
    const tx = await accolades.mint(to, id, 1, [])
    console.log('tx: ', tx.hash)
    await tx.wait()
  })
