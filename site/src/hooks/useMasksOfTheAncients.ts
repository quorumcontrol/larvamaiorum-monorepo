import { BigNumber } from "ethers"
import { useQuery } from "react-query"
import { LarvaMaiorum__factory } from "../../masks/typechain-types"
import { memoize } from "../utils/memoize"
import { calypsoProvider } from "../utils/skaleProvider"
import fetch from 'cross-fetch'
import ipfsToWeb from "../utils/ipfsToWeb"

const calypsoAddr = '0xc5C5EbfAc4901cB62c497802b00864204AB0deFa'

const getLarvaMaiorumContract = memoize(() => {
  return LarvaMaiorum__factory.connect(calypsoAddr, calypsoProvider)
})

export const useMasksOfTheAncients = (address?:string) => {
  return useQuery(["/masks", address], async () => {
    const larvaMaiorum = getLarvaMaiorumContract()
    const balance = await larvaMaiorum.balanceOf(address!)
    if (balance.eq(0)) {
      return []
    }
    return Promise.all(Array(balance.toNumber()).fill(true).map(async (_, i) => {
      const tokenId:BigNumber = await larvaMaiorum.tokenOfOwnerByIndex(address!, i)
      const url = await larvaMaiorum.tokenURI(tokenId)
      return (await fetch(ipfsToWeb(url))).json()
    }))
  }, {
    enabled: !!address
  })
}
