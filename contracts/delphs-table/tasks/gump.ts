import "@nomiclabs/hardhat-ethers"
import { utils } from "ethers"
import { task } from 'hardhat/config'
import { getWootgumpContract } from './helpers'

task('gump-balance')
  .addParam('address')
  .setAction(async ({ address }, hre) => {
    const gump = await getWootgumpContract(hre)
    const bal = await gump.balanceOf(address)
    console.log("balance: ", bal.toString())
  })

task('role')
  .addParam('address')
  .setAction(async ({ address }, hre) => {
    const gump = await getWootgumpContract(hre)
    const doesHave = await gump.hasRole(await gump.MINTER_ROLE(), address)
    console.log('does have: ', doesHave)
  })

task('mint-gump')
  .addParam('to')
  .addParam('amount')
  .setAction(async ({ to, amount }, hre) => {
    const gump = await getWootgumpContract(hre)
    const tx = await gump.mint(to, utils.parseEther(amount.toString()), { gasLimit: 2_000_000 })
    console.log('tx: ', tx)
    const receipt = await tx.wait()
    console.log("receipt: ", receipt)
  })
