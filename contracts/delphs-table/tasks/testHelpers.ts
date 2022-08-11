import "@nomiclabs/hardhat-ethers"
import { utils, Wallet } from "ethers"
import { keccak256 } from "ethers/lib/utils"
import { task } from 'hardhat/config'
import { getDelphsTableContract, getDeployer, getLobbyContract, getPlayerContract } from "./helpers"
import { faker } from '@faker-js/faker'

function hashString(msg:string) {
  return keccak256(Buffer.from(msg))
}

task('start')
  .addParam('id')
  .setAction(async ({ id }, hre) => {
    const delphs = await getDelphsTableContract(hre)
    const tx = await delphs.start(id)
    console.log('tx', tx.hash)
    await tx.wait()
  })

task('tick')
  .setAction(async (_, hre) => {
    const delphs = await getDelphsTableContract(hre)
    const start = new Date()
    const tx = await delphs.rollTheDice()
    console.log('tx', tx.hash)
    await tx.wait()
    console.log('time: ', (new Date().getTime() - start.getTime())/1000)
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
      }, {} as {[key:string]:any}))
      
  })

async function getBots(num:number) {
    const { default: botSetup } = await import('../bots')
    const botNames = Object.keys(botSetup)
    return botNames.slice(0, num).map((name) => {
      return {
        name,
        ...botSetup[name]
      }
    })

}

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

task('board')
  .addParam('name')
  .addParam('addresses')
  .addOptionalParam('bots', 'number of bots to add to the board')
  .addOptionalParam('rounds', 'number of rounds')
  .setAction(async ({ name, addresses, bots:userBots, rounds:userRounds }, hre) => {

    const rounds = userRounds ? parseInt(userRounds, 10) : 50
    const botNumber = userBots ? parseInt(userBots, 10) : 0
    const delphs = await getDelphsTableContract(hre)
    const deployer = await getDeployer(hre)
    const player = await getPlayerContract(hre)

    const isOk = await Promise.all(addresses.split(',').map((addr:string) => {
      return player.name(addr)
    }))

    isOk.forEach((is, i) => {
      if (!is) {
        console.error(`Uninitilized: ${addresses.split(',')[i]}`)
        throw new Error('address is not initialized')
      }
    })

    const tableAddrs:string[] = addresses.split(',').concat((await getBots(botNumber)).map((bot) => bot.address as string))
    const seeds = tableAddrs.map((addr) => hashString(`${name}-${addr}`))

    const id = hashString(name)
    await (await delphs.createTable(id, tableAddrs, seeds, rounds, deployer.address)).wait()
    console.log('table id: ', id)
  })
