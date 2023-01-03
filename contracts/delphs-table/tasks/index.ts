import { task } from 'hardhat/config'
import './helpers'
import './testHelpers'
import './listKeeper'
import "./gump"
import "./accolades"
import "./assignMinter"
import "./matchResults"
import { getDelphsGumpContract } from './helpers'
import { utils } from 'ethers'

task('xxx')
  .setAction(async (_, hre) => {
    const delphsGump = await getDelphsGumpContract(hre)

    const txs = [{
      to: '0xFe03cB8a8B2589cAF68589c01E26e7f3b5EAcb65',
      amount:'0x0238fd42c5cf040000'
    },
    {
      to: '0x51e37c31F7F12cC3aeD5ABDedc755CbD18C0aF29',
      amount: '0x047fdb3c3f456c0000'
    },
    {
      to: '0x3ca2201cfC32dD7c746C86A8620390c436225d5c',
      amount:'0x06659436cf28180000'
    },
    {
      to: '0xF5c6974EF06939382079A13eFB730C81a3F33122',
      amount:'0x07f808e9291e6c0000'
    }]

    const balances = await Promise.all(txs.map((tx) => {
      return delphsGump.balanceOf(tx.to)
    }))

    txs.forEach((tx, i) => {
      console.log(tx.to, utils.formatEther(tx.amount), utils.formatEther(balances[i]))
    })


  })