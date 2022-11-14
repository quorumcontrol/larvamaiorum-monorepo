import { task } from 'hardhat/config'
import { getAllowListSpot } from './helpers'

task('add-presale-supply')
  .addParam('amount', 'the amount of spots to add')
  .setAction(async ({ amount }, hre) => {
    const allowListSetter = await getAllowListSpot(hre)
    const tx = await allowListSetter.addSupply(amount)
    await tx.wait()
    console.log('done: ', tx.hash)
  })

task('set-presale-price')
.addParam('amount', 'the amount of spots to add')
  .setAction(async ({ amount }, hre) => {
    const allowListSetter = await getAllowListSpot(hre)
    const tx = await allowListSetter.setCurrentPrice(hre.ethers.utils.parseEther(amount))
    await tx.wait()
    console.log('done: ', tx.hash)
  })

task('get-buyers')
  .setAction(async (_, hre) => {
    const allowListSetter = await getAllowListSpot(hre)
    const filter = allowListSetter.filters.Purchase(null)
    const evts = await allowListSetter.queryFilter(filter)
    console.log("count: ", evts.length)
    evts.forEach((evt) => {
      console.log(evt.args.account)
    })
  })