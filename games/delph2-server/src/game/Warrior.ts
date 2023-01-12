import EventEmitter from "events";
import { defaultInitialInventory, getIdentifier, Inventory, InventoryItem, ItemDescription, itemFromInventoryItem } from './items'
import { deterministicRandom } from "./utils/randoms";
import { Item, State, Warrior as WarriorState } from '../rooms/schema/DelphsTableState'
import { Vec2 } from "playcanvas";
import { Client } from "colyseus";
import randomColor from "./utils/randomColor";
import randomPosition from "./utils/randomPosition";

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
  avatar?:string;
}

export function generateFakeWarriors(count: number, seed: string) {
  const warriors: WarriorStats[] = [];
  for (let i = 0; i < count; i++) {
    warriors[i] = {
      id: `warrior-${i}-${seed}`,
      name: `Warius ${i}`,
      attack: deterministicRandom(150, `generateFakeWarriors-${i}-attack`, seed) + 1500,
      defense: deterministicRandom(100, `generateFakeWarriors-${i}-defense`, seed) + 900,
      maxSpeed: 6.5,
      initialHealth: deterministicRandom(300, `generateFakeWarriors-${i}-health`, seed) + 1000,
      initialGump: 0,
      initialInventory: defaultInitialInventory,
      autoPlay: false,
    }
  }
  return warriors;
}

class Warrior extends EventEmitter {
  id: string;

  state: WarriorState

  position: Vec2
  client: Client

  timeWithoutCard = 0
  timeWithCard = 0

  timeSinceDeath = 0
  deathSentenceTime = 0

  isPiggy = false

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
    if (this.state.currentItem) {
      this.timeWithCard += dt
      this.checkForCardTimeout()
    }
    if (this.state.state === State.dead) {
      this.timeSinceDeath += dt
      if (this.timeSinceDeath >= this.deathSentenceTime) {
        this.recoverFromDeath()
      }
    }
    if (this.state.state === State.move && this.state.speed > 0) {
      const current = new Vec2(this.state.position.x, this.state.position.z)
      const dest = new Vec2(this.state.destination.x, this.state.destination.z)
      const vector = new Vec2().sub2(dest, current).normalize().mulScalar(this.state.speed * dt)
      current.add(vector)
      this.setPosition(current)
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

  recoverFromDeath() {
    this.timeSinceDeath = 0
    this.deathSentenceTime = 0
    this.recover(1.00)
    const { x, z } = randomPosition()
    this.setPosition(new Vec2(x, z))
    this.state.destination.assign({ x, z })
    this.setSpeed(0)
    this.setState(State.move)
    this.client.send('playAppearEffect', this.id, { afterNextPatch: true })
  }

  setPosition(newPosition:Vec2) {
    this.state.position.assign({
      x: newPosition.x,
      z: newPosition.y,
    })
    this.position = newPosition
  }

  dieForTime(seconds:number, message = "you died") {
    this.timeSinceDeath = 0
    this.deathSentenceTime = seconds
    this.setState(State.dead)
    this.sendMessage(message)
    this.clearItem()
  }

  setIsPiggy(isPiggy:boolean) {
    this.isPiggy = isPiggy
    this.updateAttackAndDefenseState()
    this.setSpeedBasedOnDestination()
  }

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
    const currentItem = this.currentItemDetails()
    if (speed >= (this.state.maxSpeed - 0.5)) {
      let additionalSpeed = 0
      if (currentItem?.speed) {
        additionalSpeed += currentItem.speed
      }
      if (this.isPiggy) {
        additionalSpeed -= 0.5
      }
      this.state.speed = speed + additionalSpeed
      return
    }
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
    let additionalAttack = 0
    if (item?.attack) {
      additionalAttack += item.attack
    }
    if (this.isPiggy) {
      additionalAttack -= (this.state.attack / 2)
    }
    return this.state.attack + additionalAttack
  }

  currentDefense() {
    const item = this.currentItemDetails()
    let additionalDefense = 0
    if (item?.defense) {
      additionalDefense += item.defense
    }
    if (this.isPiggy) {
      additionalDefense -= (this.state.defense / 2)
    }
    return this.state.defense + additionalDefense
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

  playItem(inventoryItem:InventoryItem):ItemDescription|null {
    const item = itemFromInventoryItem(inventoryItem)

    const identifier = getIdentifier(item)
    log('play item identifier: ', identifier)
    // looking for zero equality means that we allow -1 to mean "unlimited items"
    if (!this.hasCard(item)) {
      console.error('no inventory left for this item, not playing')
      return null
    }
    if (item.costToPlay > 0) {
      if (this.state.wootgumpBalance < item.costToPlay) {
        this.sendMessage("You need more gump to play that.")
        return null
      }
      this.incGumpBalance(-1 * item.costToPlay)
    }

    const inventoryRecord = this.state.inventory.get(identifier)

    inventoryRecord.quantity -= 1
    // if the item is a trap or equivalent (appliesToWorld), don't actually set it on the player
    if (item.appliesToWorld) {
      return item
    }
    this.setItemInState(inventoryItem)
    return item
  }

  hasCard(item:ItemDescription) {
    const inventoryRecord = this.state.inventory.get(item.identifier)
    if (!inventoryRecord || inventoryRecord.quantity === 0) {
      return false
    }
    // anything less than zero means "unlimited" and anything above zero means they have one
    return true
  }

  private setItemInState(item: InventoryItem) {
    log('setting item: ', item, ' existing: ', this.state.currentItem?.toJSON(), 'inventory', this.state.inventory.toJSON())
    // find it in the inventory
    const description = itemFromInventoryItem(item)
    this.state.currentItem = new Item({
      ...item,
      name: description.name,
      description: description.description,
    })
    this.updateAttackAndDefenseState()
  }

  private checkForCardTimeout() {
    const details = this.currentItemDetails()
    if (details?.timeLimit && this.timeWithCard > details.timeLimit) {
      this.clearItem()
    }
  }

  private updateAttackAndDefenseState() {
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
    this.timeWithCard = 0
  }
}

export default Warrior;
