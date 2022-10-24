import { useQuery } from 'react-query'
import { IERC721__factory } from '../../../badge-of-assembly-types'
import mainnetProvider from '../../utils/mainnetProvider'
import { memoize } from '../../utils/memoize'

const pudgyContracts = memoize(() => {
  const mainnet = mainnetProvider()
  const pudgies = IERC721__factory.connect('0xbd3531da5cf5857e7cfaa92426877b022e612cf8', mainnet)
  const lilPudgies = IERC721__factory.connect('0x524cab2ec69124574082676e6f654a18df49a048', mainnet)
  const rogs = IERC721__factory.connect('0x062e691c2054de82f28008a8ccc6d7a1c8ce060d', mainnet)
  return [pudgies, lilPudgies, rogs]
})

export const hasPudgy = async (address:string) => {
  const [pudgies, lilPudgies, rogs] = pudgyContracts()

  const [pudgBal, lilBal, rogBal] = await Promise.all([
    pudgies.balanceOf(address),
    lilPudgies.balanceOf(address),
    rogs.balanceOf(address),
  ])

  return !(pudgBal.eq(0) && lilBal.eq(0) && rogBal.eq(0))
}

export const useHasPudgy = (address?:string) => {
  return useQuery(
    ['/has-pudgy', address],
    async () => {
      return hasPudgy(address!)
    },
    {
      enabled: !!address
    }
  )
}
