import EventEmitter from "events";
import debug from 'debug'
import items, { getIdentifier, Inventory, InventoryItem } from './items'
import { deterministicRandom } from "../utils/randoms";

const log = debug('Warrior')

export interface WarriorStats {
  id: string;
  name: string;
  attack: number;
  defense: number;
  initialHealth: number;
  initialGump: number;
  initialInventory: Inventory;
  autoPlay: boolean;
}

export interface WarriorState extends WarriorStats {
  currentHealth: number;
  wootgumpBalance: number;
  location?: [number,number];
  inventory: Inventory;
  currentItem?: InventoryItem;
  destination?: [number,number]
}

export function generateFakeWarriors(count: number, seed: string) {
  const warriors: Warrior[] = [];
  for (let i = 0; i < count; i++) {
    warriors[i] = new Warrior({
      id: `warrior-${i}-${seed}`,
      name: `Warius ${i}`,
      attack: deterministicRandom(1000, `generateFakeWarriors-${i}-attack`, seed),
      defense: deterministicRandom(800, `generateFakeWarriors-${i}-defense`, seed),
      initialHealth: deterministicRandom(2000, `generateFakeWarriors-${i}-health`, seed),
      initialGump: 0,
      initialInventory: {},
      autoPlay: false,
    });
  }
  return warriors;
}

function deepClone<T>(obj:T):T {
  return JSON.parse(JSON.stringify(obj)) as T
}

class Warrior extends EventEmitter implements WarriorStats {
  id: string;
  name: string = "DefaultName";
  attack: number = 200;
  defense: number = 100;
  initialHealth: number = 500;
  currentHealth: number = 500;
  initialGump: number = 0;
  initialInventory: Inventory
  inventory: Inventory
  autoPlay: boolean;

  currentItem?: InventoryItem

  // destination?: Vec3;

  wootgumpBalance: number;

  constructor(opts: WarriorStats) {
    super()
    this.id = opts.id;
    this.name = opts.name;
    this.attack = opts.attack;
    this.defense = opts.defense;
    this.initialHealth = opts.initialHealth;
    this.currentHealth = this.initialHealth;
    this.wootgumpBalance = opts.initialGump;
    this.initialGump = opts.initialGump;
    this.initialInventory = opts.initialInventory
    this.inventory = deepClone(opts.initialInventory)
    this.autoPlay = opts.autoPlay
  }

  toWarriorState():WarriorState {
    return {
      id: this.id,
      name: this.name,
      attack: this.attack,
      defense: this.defense,
      initialHealth: this.initialHealth,
      initialGump: this.initialGump,
      initialInventory: this.initialInventory,
      autoPlay: this.autoPlay,
      currentHealth: this.currentHealth,
      wootgumpBalance: this.wootgumpBalance,
      currentItem: this.currentItem,
      inventory:this.inventory,
    }
  }

  isAlive() {
    return this.currentHealth > 0;
  }

  currentAttack() {
    const item = this.currentItemDetails()
    if (!item) {
      return this.attack
    }
    return this.attack + (item.attack || 0)
  }

  currentDefense() {
    const item = this.currentItemDetails()
    if (!item) {
      return this.defense
    }
    return this.defense + (item.defense || 0)
  }

  // amount to add to health as a decimal percentage (ie 0.10 is 10%) of initialHealth
  recover(percentage: number) {
    if (this.currentHealth >= this.initialHealth) {
      return 0;
    }
    if (this.currentHealth < 0) {
      const amountToTopUp = this.currentHealth * -1
      this.currentHealth = 0
      return amountToTopUp
    }
    const amountToUp = Math.min(
      this.initialHealth * percentage,
      this.initialHealth - this.currentHealth
    );
    this.currentHealth += amountToUp;
    return amountToUp;
  }

  // randomItem(seed:string) {
  //   const available = Object.values(this.inventory).filter((i) => i.quantity > 0)
  //   if (available.length === 0) {
  //     return
  //   }
  //   const i = deterministicRandom(available.length - 1 , `${this.id}-${available.length}`, seed)
  //   this.setItem(available[i].item)
  // }

  setItem(item:InventoryItem) {
    log('setting item: ', item, ' existing: ', this.currentItem)
    // find it in the inventory
    const inventoryRecord = this.inventory[getIdentifier(item)]
    if (!inventoryRecord || inventoryRecord.quantity <= 0) {
      console.error('no inventory left for this item, not playing')
      return
    }
    inventoryRecord.quantity -= 1
    this.currentItem = item
  }

  currentItemDetails() {
    if (!this.currentItem) {
      return null
    }
    return items.find((i) => i.address == this.currentItem!.address && i.id == this.currentItem!.id)
  }

  clearItem() {
    this.currentItem = undefined
  }
}

export default Warrior;
