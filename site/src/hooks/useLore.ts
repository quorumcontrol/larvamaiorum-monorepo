import { DateTime } from 'luxon'
import { memoize } from '../utils/memoize'
import multicallWrapper from '../utils/multicallWrapper'
import { skaleProvider } from '../utils/skaleProvider'
import { GraphicLore, GraphicLore__factory } from '../../lore-books/typechain-types'

import testnetAddresses from '../../lore-books/deployments/skaletest/addresses.json'
import { useQuery } from 'react-query'
import { BigNumber } from 'ethers'
// import mainnetAddresses from '../../lore-books/deployments/skale/addresses.json'

export const isTestnet = !process.env.NEXT_PUBLIC_MAINNET

export const addresses = () => {
  if (isTestnet) {
    return testnetAddresses
  }
  throw new Error('mainnet not supported yet')
  // return mainnetAddresses
}

const startDate = DateTime.utc(2022, 9, 1)

export const loreContract = memoize(() => {
  const multiCall = multicallWrapper(skaleProvider)
  return multiCall.syncWrap<GraphicLore>(GraphicLore__factory.connect(addresses().GraphicLore, skaleProvider))
})

export const loreTokens = (): Record<string, { id: string, name: string, startDate: DateTime, available: boolean, viewable: boolean }> => {
  const today = DateTime.utc()
  const tokens = [
    {
      name: "Historia Colossei I: Cover",
    },
    {
      name: "Historia Colossei I: Page 1",
    },
    {
      name: "Historia Colossei I: Page 2",
    },
    {
      name: "Historia Colossei I: Page 3",
    },
    {
      name: "Historia Colossei I: Page 4",
    },
    {
      name: "Historia Colossei I: Page 5",
    },
  ]
  return tokens.reduce((memo, tok, i) => {
    const tokenStart = startDate.plus({ days: i })
    const available = DateTime.min(today, tokenStart).equals(tokenStart)
    return {
      ...memo,
      [i.toString()]: {
        ...tok,
        id: i.toString(),
        startDate: tokenStart,
        available,
        viewable: available || DateTime.min(today.plus({days: 1}), tokenStart).equals(tokenStart)
      }
    }
  }, {})
}

function todays() {
  const tokens = loreTokens()
  const idOfAvailable = Object.keys(loreTokens).sort().reverse().find((id) => {
    return tokens[id].available
  })
  if (!idOfAvailable) {
    return tokens['0']
  }
  return tokens[idOfAvailable]
}

export const useLore = (address?: string) => {
  const userLore = useQuery(['/user-lore', address], async ():Promise<Record<string, BigNumber>> => {
    const lore = loreContract()
    const balances = await Promise.all(
      Object.keys(loreTokens()).map(async (id) => {
        return {
          id,
          balance: await lore.balanceOf(address!, id)
        }
      })
    )
    return balances.reduce((memo, balance) => {
      return {
        ...memo,
        [balance.id]: balance.balance,
      }
    }, {})
  }, {
    enabled: !!address
  })

  return {
    userLore,
    loreTokens: loreTokens(),
    todays: todays(),
  }
}
