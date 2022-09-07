import "@nomiclabs/hardhat-ethers"
import { utils } from "ethers"
import { task } from 'hardhat/config'
import { getAccoladeContract, getWootgumpContract } from './helpers'

task('assign-minter')
  .addParam('address')
  .setAction(async ({ address }, hre) => {
    const gump = await getWootgumpContract(hre)
    const accolades = await getAccoladeContract(hre)
    console.log('assign gump minter')
    const tx1 = await gump.grantRole(await gump.MINTER_ROLE(), address)
    await tx1.wait()

    console.log('assign accolades minter')
    const tx2 = await accolades.grantRole(await accolades.MINTER_ROLE(), address)
    await tx2.wait()
  })
