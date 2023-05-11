import { task } from 'hardhat/config'
import { getLarvaMaiorum } from './helpers'

task('create-minger', "creates a new random wallet and returns the private key and the address")
  .setAction(async (_, hre) => {
    const wallet = hre.ethers.Wallet.createRandom()

    console.log('address: ', wallet.address, 'private key: ', wallet.privateKey)
  })
