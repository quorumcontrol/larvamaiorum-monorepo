
export interface InventoryItem {
  address: string
  id: number
}

export function getIdentifier(item: InventoryItem) {
  return `${item.address}-${item.id}`
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
  description: string
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
    description: "No need to battle, just steal 10% of your opponent's gump.",
    avoidBattle: true,
    takeGump: 0,
  },
  {
    address: zeroAddr,
    id: 2,
    name: "Berserk",
    description: 'Gives your warrior +2000 attack at the cost of 500 defense and 100 health points.',
    attack: 2000,
    defense: -400,
    hp: -100,
  },
  {
    address: zeroAddr,
    id: 3,
    name: "Thief",
    description: "Escape the next battle you're in.",
    avoidBattle: true,
    takeGump: 0.10
  }
].map((i) => {
  return {
    identifier: getIdentifier(i),
    ...i
  }
})

export const itemsByIdentifier = items.reduce((memo, item) => {
  return {
    [item.identifier]: item,
    ...memo
  }
}, {} as Record<string,ItemDescription>)

export const defaultInitialInventory:Inventory = items.reduce((memo, item) => {
  return {
    [item.identifier]: { quantity: 1, item: { address: item.address, id: item.id } },
    ...memo
  }
}, {} as Inventory)

export default items
