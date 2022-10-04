
export interface InventoryItem {
  address: string
  id: number
}

// expected to be ${address}-${id}
type InventoryIdentifier = string

export type Inventory = Record<InventoryIdentifier, {quantity: number, item: InventoryItem}>

const zeroAddr = '0x0000000000000000000000000000000000000000'

interface ItemDescription {
  identifier: InventoryIdentifier
  address: string
  id: number
  name: string
  avoidBattle?: boolean
  takeGump?: number
  attack?:number
  defense?:number
  hp?:number
}

const items:ItemDescription[] = [
  {
    address: zeroAddr,
    id: 1,
    name: "Evade",
    avoidBattle: true,
    takeGump: 0,
  },
  {
    address: zeroAddr,
    id: 2,
    name: "Beserk",
    attack: 2000,
    defense: -500,
    hp: -100,
  },
  {
    address: zeroAddr,
    id: 3,
    name: "Thief",
    avoidBattle: true,
    takeGump: 0.10
  }
].map((i) => {
  return {
    identifier: `${i.address}-${i.id}`,
    ...i
  }
})

export const itemsByName = items.reduce((memo, item) => {
  return {
    [item.name]: item,
    ...memo
  }
}, {} as Record<string,InventoryItem>)

export default items
