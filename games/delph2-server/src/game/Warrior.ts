import EventEmitter from "events";
import debug from 'debug'
import items, { defaultInitialInventory, getIdentifier, Inventory, InventoryItem, ItemDescription, itemFromInventoryItem } from './items'
import { deterministicRandom } from "./utils/randoms";
import { Item, State, Warrior as WarriorState } from '../rooms/schema/DelphsTableState'
import { Vec2 } from "playcanvas";
import { Client } from "colyseus";
import randomColor from "./utils/randomColor";

const log = console.log //debug('Warrior')

// const berserkIdentifier = '0x0000000000000000000000000000000000000000-2'

export interface WarriorStats {
  id: string;
  name: string;
  attack: number;
  defense: number;
  maxSpeed: number;
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
      attack: deterministicRandom(1500, `generateFakeWarriors-${i}-attack`, seed) + 500,
      defense: deterministicRandom(500, `generateFakeWarriors-${i}-defense`, seed) + 400,
      maxSpeed: 5,
      initialHealth: deterministicRandom(1000, `generateFakeWarriors-${i}-health`, seed) + 1000,
      initialGump: 0,
      initialInventory: defaultInitialInventory,
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

  state: WarriorState

  position: Vec2
  // currentItem?: InventoryItem

  client: Client

  timeWithoutCard = 0

  // destination?: Vec3;

  constructor(client: Client, state: WarriorState) {
    super()
    this.client = client
    this.id = state.id
    this.state = state
    this.position = new Vec2(state.position.x, state.position.z)
    const color: [number, number, number] = randomColor({ format: 'rgbArray', seed: `playerColor-${this.id}`, luminosity: 'light' }).map((c: number) => c / 255);
    state.color.clear()
    state.color.push(...color)
  }

  update(dt: number) {
    if (this.state.state === State.move && this.state.speed > 0) {
      const current = new Vec2(this.state.position.x, this.state.position.z)
      const dest = new Vec2(this.state.destination.x, this.state.destination.z)
      const vector = new Vec2().sub2(dest, current).normalize().mulScalar(this.state.speed * dt)
      current.add(vector)
      this.state.position.assign({
        x: current.x,
        z: current.y,
      })
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
    // if (!this.state.currentItem && this.state.inventory.get(berserkIdentifier).quantity === 0) {
    //   this.timeWithoutCard += dt
    //   if (this.timeWithoutCard > 45) {
    //     this.spawnBerserk()
    //   }
    // }
  }

  // spawnBerserk() {
  //   this.state.inventory.get(berserkIdentifier).quantity += 1
  //   this.sendMessage('New Card!')
  // }

  sendMessage(message:string) {
    console.log('send mainhudmessage', message)
    this.client.send('mainHUDMessage', message)
  }

  incGumpBalance(amount: number) {
    if (amount !== 0) {
      this.client.send('gumpDiff', amount)
    }

    this.state.wootgumpBalance += amount
  }

  setSpeed(speed: number) {
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
      case State.deerAttack:
        this.setSpeed(0)
        return
    }
  }

  private setSpeedBasedOnDestination() {
    const dist = this.distanceToDestination()
    if (dist > 1.5) {
      this.setSpeed(this.state.maxSpeed)
      return
    }
    if (dist > 0.25) {
      this.setSpeed(2)
      return
    }
    this.setSpeed(0)
  }

  setDestination(x: number, z: number) {
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
      this.state.currentHealth = 0
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

  playItem(inventoryItem:InventoryItem):ItemDescription|null {
    const item = itemFromInventoryItem(inventoryItem)

    const identifier = getIdentifier(item)
    log('identifier: ', identifier)
    const inventoryRecord = this.state.inventory.get(identifier)
    log('record: ', inventoryRecord?.toJSON())
    if (!inventoryRecord || inventoryRecord.quantity <= 0) {
      console.error('no inventory left for this item, not playing')
      return null
    }

    inventoryRecord.quantity -= 1
    if (item.appliesToWorld) {
      return item
    }
    this.setItem(inventoryItem)
    return item
  }

  setItem(item: InventoryItem) {
    log('setting item: ', item, ' existing: ', this.state.currentItem?.toJSON(), 'inventory', this.state.inventory.toJSON())
    // find it in the inventory
    const description = itemFromInventoryItem(item)
    this.state.currentItem = new Item({
      ...item,
      name: description.name,
      description: description.description,
    })
    this.state.currentAttack = this.currentAttack()
    this.state.currentDefense = this.currentDefense()
  }

  currentItemDetails() {
    if (!this.state.currentItem) {
      return null
    }
    return itemFromInventoryItem(this.state.currentItem)
  }

  clearItem() {
    this.state.currentItem = undefined
    this.state.currentAttack = this.currentAttack()
    this.state.currentDefense = this.currentDefense()
    this.timeWithoutCard = 0
  }
}

export default Warrior;
