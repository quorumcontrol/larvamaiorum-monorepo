import { DateTime } from 'luxon'
import { memoize } from '../utils/memoize'
import multicallWrapper from '../utils/multicallWrapper'
import { skaleProvider } from '../utils/skaleProvider'
import { GraphicLore, GraphicLore__factory } from '../../lore-books/typechain-types'

import testnetAddresses from '../../lore-books/deployments/skaletest/addresses.json'
import { useQuery } from 'react-query'
import { BigNumber } from 'ethers'
// import mainnetAddresses from '../../lore-books/deployments/skale/addresses.json'

import cover from "../../assets/images/lore/000_lore.jpg";
import page1 from "../../assets/images/lore/001_lore.jpg";
import page2 from "../../assets/images/lore/002_lore.jpg";
import page3 from "../../assets/images/lore/003_lore.jpg";
import page4 from "../../assets/images/lore/004_lore.jpg";
import page5 from "../../assets/images/lore/005_lore.jpg";

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

export const loreTokens = (): Record<string, { id: string, image: typeof cover, name: string, startDate: DateTime, available: boolean, viewable: boolean }> => {
  const today = DateTime.utc()
  const tokens = [
    {
      name: "Historia Colossei I: Cover",
      image: cover,
    },
    {
      name: "Historia Colossei I: Page 1",
      image: page1,
    },
    {
      name: "Historia Colossei I: Page 2",
      image: page2,
    },
    {
      name: "Historia Colossei I: Page 3",
      image: page3,
    },
    {
      name: "Historia Colossei I: Page 4",
      image: page4,
    },
    {
      name: "Historia Colossei I: Page 5",
      image: page5,
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
