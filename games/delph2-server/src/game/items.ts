import { GameNags } from "../rooms/schema/DelphsTableState"

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

export interface ItemDescription {
  identifier: InventoryIdentifier
  address: string
  id: number
  name: string
  description: string
  costToPlay:number
  art:string
  frameColor:string

  field?: boolean
  battle?: boolean

  attack?:number
  defense?:number
  hp?:number
  speed?:number
  timeLimit?:number
  appliesToWorld?:boolean
  repels?: GameNags[],
  affectsAllPlayers?: boolean
}

const items:ItemDescription[] = [
  {
    address: zeroAddr,
    id: 1,
    name: "Trap",
    description: "Drop a trap on the board.",
    costToPlay: 5,
    appliesToWorld: true,
    field: true,
    art: "https://delphsart.s3.fr-par.scw.cloud/trap.png",
    frameColor: "#432E22",
  },
  {
    address: zeroAddr,
    id: 2,
    name: "Berserk",
    description: 'Gives warrior +2000 attack and +1 speed at the cost of 400 defense and 100 health points.',
    attack: 2000,
    defense: -400,
    hp: -100,
    costToPlay: 15,
    speed: 1,
    field: true,
    repels: [GameNags.deer],
    art: "https://delphsart.s3.fr-par.scw.cloud/berserk.png",
    frameColor: "#869897",
  },
  {
    address: zeroAddr,
    id: 3,
    name: "Speed",
    description: "Increase the speed of your player for 15s.",
    costToPlay: 10,
    speed: 3,
    timeLimit: 15,
    field: true,
    art: "https://delphsart.s3.fr-par.scw.cloud/speed.png",
    frameColor: "#432E22",
  },
  {
    address: zeroAddr,
    id: 4,
    name: "Kindness",
    description: "Protects the entire board from the gods.",
    costToPlay: 10,
    speed: 0,
    timeLimit: 60,
    field: true,
    art: "https://delphsart.s3.fr-par.scw.cloud/gift.png",
    frameColor: "#37363B",
    repels: [GameNags.roving],
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

export const defaultInitialInventory:Inventory = {
  [items[0].identifier]: {quantity: 20, item: { address: items[0].address, id: items[0].id }},
  [items[1].identifier]: {quantity: 20, item: { address: items[1].address, id: items[1].id }},
  [items[2].identifier]: {quantity: 20, item: { address: items[2].address, id: items[2].id }},
}

export function itemFromInventoryItem(inventoryItem:InventoryItem) {
  const identifier = getIdentifier(inventoryItem)
  return itemsByIdentifier[identifier]
}

export default items
