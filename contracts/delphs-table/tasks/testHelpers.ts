import "@nomiclabs/hardhat-ethers"
import { utils, Wallet } from "ethers"
import { task } from 'hardhat/config'
import { getDelphsTableContract, getDeployer, getPlayerContract } from "./helpers"
import { faker } from '@faker-js/faker'

task('tick')
  .setAction(async (_, hre) => {
    const delphs = await getDelphsTableContract(hre)
    const start = new Date()
    const tx = await delphs.rollTheDice()
    console.log('tx', tx.hash)
    await tx.wait()
    console.log('time: ', (new Date().getTime() - start.getTime()) / 1000)
  })

task('setup-bots', 'setup a number of bots')
  .addParam('amount', 'the number of bots to create')
  .setAction(async ({ amount }, hre) => {
    const deployer = await getDeployer(hre)
    const player = await getPlayerContract(hre)
    const names = Array(parseInt(amount, 10)).fill(true).map(() => {
      return faker.internet.userName()
    })
    const wallets = names.map((name) => {
      return {
        name,
        wallet: Wallet.createRandom(),
      }
    })
    for (const wallet of wallets) {
      console.log('creating ', wallet.name)
      const addr = await wallet.wallet.getAddress()
      await deployer.sendTransaction({
        to: addr,
        value: utils.parseEther('0.2')
      })
      await player.connect(wallet.wallet.connect(hre.ethers.provider)).setUsername(wallet.name)
    }

    console.log(wallets.reduce((memo, wallet) => {
      return {
        ...memo,
        [wallet.name]: {
          pk: wallet.wallet.privateKey,
          address: wallet.wallet.address
        }
      }
    }, {} as { [key: string]: any }))

  })

task('player')
  .addParam('addr')
  .setAction(async ({ addr }, hre) => {
    const player = await getPlayerContract(hre)
    console.log(await player.name(addr))
  })

task('run-game')
  .addParam('id')
  .setAction(async ({ id }, hre) => {
    const delphs = await getDelphsTableContract(hre)
    await (await delphs.start(id)).wait()
    const table = await delphs.tables(id)
    const started = table.startedAt
    const len = table.gameLength
    const latest = await delphs.latestRoll()
    const remaining = len.sub(latest.sub(started)).toNumber()
    for (let i = 0; i < remaining; i++) {
      const tx = await delphs.rollTheDice()
      console.log('dice roll: ', tx.hash)
      await tx.wait()
      console.log('ok')
    }
    console.log('done')
  })
