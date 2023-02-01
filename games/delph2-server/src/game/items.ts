import { GameNags } from "../rooms/schema/DelphsTableState"
import { randomInt } from "./utils/randoms"

export interface InventoryItem {
  address: string
  id: number
}

export function getIdentifier(item: InventoryItem) {
  return `${item.address}-${item.id}`
}

// expected to be ${address}-${id}
type InventoryIdentifier = string

// export type Inventory = Record<InventoryIdentifier, {quantity: number, item: InventoryItem}>
export type Inventory = ItemDescription[]

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
  affectsAllPlayers?: boolean,
  cancels?: string[],
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
    description: 'Gives warrior +1000 attack and +1 speed at the cost of 500 defense and 300 health points.',
    attack: 1000,
    defense: -500,
    hp: -300,
    costToPlay: 15,
    speed: 1,
    field: true,
    timeLimit: 45,
    repels: [GameNags.deer],
    art: "https://delphsart.s3.fr-par.scw.cloud/berserk.png",
    frameColor: "#869897",
  },
  {
    address: zeroAddr,
    id: 3,
    name: "Speed",
    description: "Increase the speed of your player by 3 for 15s.",
    costToPlay: 10,
    speed: 3,
    timeLimit: 20,
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
    timeLimit: 60,
    field: true,
    art: "https://delphsart.s3.fr-par.scw.cloud/gift.png",
    frameColor: "#37363B",
    repels: [GameNags.roving],
    cancels: ["berserk"],
    affectsAllPlayers: true,
  },
  {
    address: zeroAddr,
    id: 5,
    name: "Aggressive",
    description: "Focus on attack over defense at all costs.",
    battle: true,
    attack: 150,
    defense: -200,
    costToPlay: 5,
    art: "https://delphsart.s3.fr-par.scw.cloud/aggressive.png",
    frameColor: "#37363B",
    cancels: ["balanced", "snake fu"]
  },
  {
    address: zeroAddr,
    id: 6,
    name: "Defensive",
    description: "Focus on defense over attack at all costs.",
    battle: true,
    attack: -200,
    defense: 150,
    costToPlay:5,
    art: "https://delphsart.s3.fr-par.scw.cloud/defensive.png",
    frameColor: "#37363B",
    cancels: ["aggressive", "evasive"]
  },
  {
    address: zeroAddr,
    id: 7,
    name: "Snake Fu",
    description: "An ancient style of combat based on the movement of snakes.",
    battle: true,
    costToPlay:10,
    attack: 200,
    defense: 200,
    art: "https://delphsart.s3.fr-par.scw.cloud/snake.png",
    frameColor: "#37363B",
    cancels: ["defensive", "evasive"]
  },
  {
    address: zeroAddr,
    id: 8,
    name: "Evasive",
    description: "Attempt to dodge your opponent whenever possible.",
    battle: true,
    costToPlay:7,
    attack: -150,
    defense: 200,
    health: 200,
    art: "https://delphsart.s3.fr-par.scw.cloud/evasive.png",
    frameColor: "#37363B",
    cancels: ["aggressive"],
    // flipsAgainst: ["balanced"]
  },
  {
    address: zeroAddr,
    id: 9,
    name: "Balanced",
    description: "A balanced strategy of attack and defense.",
    battle: true,
    costToPlay:7,
    attack: 150,
    defense: 150,
    art: "https://delphsart.s3.fr-par.scw.cloud/balanced.png",
    frameColor: "#37363B",
    cancels: ["defensive", "snake fu", "berserk"],
    // flipsAgainst: ["evasive"]
  },
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

// export const defaultInitialInventory:Inventory = [0,1,2,4,5,8].reduce((inventory, itemsId) => {
//   inventory[items[itemsId].identifier] = {quantity: -1, item: { address: items[itemsId].address, id: items[itemsId].id }}
//   return inventory
// }, {} as Inventory) 

export const randomInventory = (numberOfcards:number):Inventory => {
  return Array(numberOfcards).fill(true).map((_, i) => {
    return randomItem()
  })
}

export const randomItem = () => {
  const itemArray = Object.values(items)
  return itemArray[randomInt(itemArray.length)]
  // return itemArray[3]
}

// export function itemFromInventoryItem(inventoryItem:InventoryItem) {
//   const identifier = getIdentifier(inventoryItem)
//   return itemsByIdentifier[identifier]
// }

export default items
