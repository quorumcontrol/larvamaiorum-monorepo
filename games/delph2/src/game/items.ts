
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

export const zeroAddr = '0x0000000000000000000000000000000000000000'

export interface ItemDescription {
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
