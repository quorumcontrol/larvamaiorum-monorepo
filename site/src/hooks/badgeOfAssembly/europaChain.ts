import { useQuery } from "react-query"
import { providers } from "ethers"
import { RubyRouter__factory } from "./externalContracts"

const rubySklAddress = '0xE0595a049d02b7674572b0d59cd4880Db60EDC50'

const rubyRouterAddress = '0x2FA290DCb232B04D2f97F4d4ad45396b62193D51'

const europaProvider = new providers.JsonRpcProvider('https://mainnet.skalenodes.com/v1/elated-tan-skat')

export const isTxEuropaSkalePurchase = async (address:string, txHash:string) => {
  const receipt = await europaProvider.getTransactionReceipt(txHash)
  if (!receipt) {
    throw new Error('no transaction')
  }
  if (receipt.from !== address) {
    return false
  }
  const rubyRouterContractInterface = RubyRouter__factory.createInterface()
  const evt = receipt.logs.find((log) => {
    return log.topics[0] === rubyRouterContractInterface.getEventTopic('Swap')
  })
  if (!evt) {
    return false
  }
  const parsed = rubyRouterContractInterface.parseLog(evt)
  console.log('parsed: ', parsed)
  return parsed.name === 'Swap' && parsed.args.token1 == rubySklAddress
}

export const hasBoughtSkale = async function(address:string) {
  const rubyRouter = RubyRouter__factory.connect(rubyRouterAddress, europaProvider)
  const filter = rubyRouter.filters.Swap(address, null, null, null, null, null)
  const currentBlock = await europaProvider.getBlockNumber()
  const events = await rubyRouter.queryFilter(filter, currentBlock - 64000, currentBlock)
  const evt = events.find((evt) => evt.args.token1 === rubySklAddress)
  if (!evt) {
    return null
  }
  const tx = (await evt.getTransaction())
  console.log('tx: ', tx)
  return tx.hash
}

export const useHasBoughtSkale = (address?:string) => {
  return useQuery(['has-bought-skale', address], () => hasBoughtSkale(address!), {
    enabled: !!address
  })
}
