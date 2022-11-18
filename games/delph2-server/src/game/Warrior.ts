import EventEmitter from "events";
import debug from 'debug'
import items, { getIdentifier, Inventory, InventoryItem } from './items'
import { deterministicRandom } from "./utils/randoms";
import { State, Warrior as WarriorState } from '../rooms/schema/DelphsTableState'
import { Vec2 } from "playcanvas";

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

// export interface WarriorState extends WarriorStats {
//   currentHealth: number;
//   wootgumpBalance: number;
//   location?: [number,number];
//   inventory: Inventory;
//   currentItem?: InventoryItem;
//   destination?: [number,number]
// }

export function generateFakeWarriors(count: number, seed: string) {
  const warriors: WarriorStats[] = [];
  for (let i = 0; i < count; i++) {
    warriors[i] = {
      id: `warrior-${i}-${seed}`,
      name: `Warius ${i}`,
      attack: deterministicRandom(1000, `generateFakeWarriors-${i}-attack`, seed),
      defense: deterministicRandom(800, `generateFakeWarriors-${i}-defense`, seed),
      initialHealth: deterministicRandom(2000, `generateFakeWarriors-${i}-health`, seed),
      initialGump: 0,
      initialInventory: {},
      autoPlay: false,
    }
  }
  return warriors;
}

// function deepClone<T>(obj:T):T {
//   return JSON.parse(JSON.stringify(obj)) as T
// }

class Warrior extends EventEmitter {
  id: string;
  // name: string = "DefaultName";
  // attack: number = 200;
  // defense: number = 100;
  // initialHealth: number = 500;
  // currentHealth: number = 500;
  // initialGump: number = 0;
  // initialInventory: Inventory
  // inventory: Inventory
  // autoPlay: boolean;

  state: WarriorState

  position:Vec2
  currentItem?: InventoryItem

  // destination?: Vec3;

  wootgumpBalance: number;

  constructor(state:WarriorState) {
    super()
    this.id = state.id
    this.state = state
    this.position = new Vec2(state.position.x, state.position.z)
  }

  update(dt:number) {
    if (this.state.state === State.move && this.state.speed > 0) {
      const current = new Vec2(this.state.position.x, this.state.position.z)
      const dest = new Vec2(this.state.destination.x, this.state.destination.z)
      const vector = new Vec2().sub2(dest, current).normalize().mulScalar(this.state.speed * dt)
      current.add(vector)
      this.state.position.assign({
        x: current.x,
        z: current.y,
      })
      console.log(this.id, this.state.position.toJSON())
      this.position = current
      const distance = current.distance(dest)
      if (distance <= 0.25) {
        this.setSpeed(0)
        return
      }
      if (distance <= 2) {
        this.setSpeed(2)
        return
      }
    }
  }

  incGumpBalance(amount:number) {
    this.state.wootgumpBalance += amount
  }

  setSpeed(speed:number) {
    this.state.speed = speed
  }
  
  setState(state: State) {
    this.state.state = state // state state state statey state
    switch (state) {
      case State.move:
        this.setSpeedBasedOnDestination()
        return
      case State.battle:
        this.setSpeed(0)
        return
    }
  }

  private setSpeedBasedOnDestination() {
    const dist = this.distanceToDestination()
    console.log('dist to dest: ', dist)
    if (dist > 2) {
      this.setSpeed(4)
      return
    }
    if (dist > 0.25) {
      this.setSpeed(2)
      return
    }
    this.setSpeed(0)
  }

  setDestination(x: number, z:number) {
    this.state.destination.assign({
      x,
      z,
    })
    this.setSpeedBasedOnDestination()
  }

  private distanceToDestination() {
    return new Vec2(this.state.position.x, this.state.position.z).distance(new Vec2(this.state.destination.x, this.state.destination.z))
  }

  isAlive() {
    return this.state.currentHealth > 0;
  }

  currentAttack() {
    const item = this.currentItemDetails()
    if (!item) {
      return this.state.attack
    }
    return this.state.attack + (item.attack || 0)
  }

  currentDefense() {
    const item = this.currentItemDetails()
    if (!item) {
      return this.state.defense
    }
    return this.state.defense + (item.defense || 0)
  }

  // amount to add to health as a decimal percentage (ie 0.10 is 10%) of initialHealth
  recover(percentage: number) {
    if (this.state.currentHealth >= this.state.initialHealth) {
      return 0;
    }
    if (this.state.currentHealth < 0) {
      const amountToTopUp = this.state.currentHealth * -1
      this.state.currentHealth = 0
      return amountToTopUp
    }
    const amountToUp = Math.min(
      this.state.initialHealth * percentage,
      this.state.initialHealth - this.state.currentHealth
    );
    this.state.currentHealth += amountToUp;
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
    log('setting item: ', item, ' existing: ', this.state.currentItem)
    // find it in the inventory
    const inventoryRecord = this.state.inventory.get(getIdentifier(item))
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
