import { Inventory, ItemDescription, itemsByIdentifier, randomInventory, randomItem } from './items'
import { deterministicRandom, randomInt } from "./utils/randoms";
import { Item, BehavioralState, Warrior as WarriorState } from '../rooms/schema/DelphsTableState'
import { Client, Room } from "colyseus";
import randomColor from "./utils/randomColor";
import randomPosition from "./utils/randomPosition";
import LocomotionLogic from './LocomotionLogic';
import { Battler, BattlerType } from './BattleLogic2';

const log = console.log //debug('Warrior')

// const berserkIdentifier = '0x0000000000000000000000000000000000000000-2'

export interface WarriorStats {
  id: string;
  name: string;
  attack: number;
  defense: number;
  maxSpeed: number;
  walkSpeed: number;
  initialHealth: number;
  initialGump: number;
  inventory: Inventory;
  autoPlay: boolean;
  avatar?: string;
}

export function randomBattleStats(seed:string) {
  return {
    attack: deterministicRandom(150, `generateFakeWarriors-${seed}-attack`, seed) + 1500,
    defense: deterministicRandom(100, `generateFakeWarriors-${seed}-defense`, seed) + 900,
    initialHealth: deterministicRandom(300, `generateFakeWarriors-${seed}-health`, seed) + 1000,
  }
}

export function generateWarrior(seed: string, name?: string): WarriorStats {
  return {
    id: `warrior-${seed}`,
    ...randomBattleStats(seed),
    name: name || `Warius${randomInt(1000)}`,
    maxSpeed: 6.5,
    walkSpeed: 2,
    initialGump: 0,
    inventory: randomInventory(3),
    autoPlay: false,
  }
}

class Warrior implements Battler {
  id: string;

  state: WarriorState

  locomotion: LocomotionLogic

  // position: Vec2
  client?: Client

  timeWithoutCard = 0
  timeWithCard = 0

  timeSinceDeath = 0
  deathSentenceTime = 0

  isPiggy = false

  battlerType = BattlerType.warrior

  constructor(state: WarriorState, client?: Client, debugRoom?:Room) {
    this.client = client
    this.id = state.id
    this.state = state
    this.locomotion = new LocomotionLogic(state.locomotion, 0.75, debugRoom)
    const color: [number, number, number] = randomColor({ format: 'rgbArray', seed: `playerColor-${this.id}`, luminosity: 'light' }).map((c: number) => c / 255);
    state.color.clear()
    state.color.push(...color)
  }

  get name() {
    return this.state.name
  }

  update(dt: number) {
    this.locomotion.update(dt)

    if (this.state.currentItem) {
      this.timeWithCard += dt
      this.checkForCardTimeout()
      this.setAdditionalSpeed()
    }
    if (this.state.behavioralState === BehavioralState.dead) {
      this.timeSinceDeath += dt
      if (this.timeSinceDeath >= this.deathSentenceTime) {
        this.recoverFromDeath()
      }
    }
  }

  battleCommands() {
    return this.state.battleCommands
  }

  recoverFromDeath() {
    console.log(this.id, "recover form death")
    this.timeSinceDeath = 0
    this.deathSentenceTime = 0
    this.recover(1.00)
    const { x, z } = randomPosition()
    this.locomotion.setPosition(x, z)
    this.locomotion.setDestination(x, z)
    this.locomotion.unfreeze()
    this.setState(BehavioralState.move)
    this.client?.send('playAppearEffect', this.id, { afterNextPatch: true })
  }

  dieForTime(seconds: number, message = "you died") {
    this.timeSinceDeath = 0
    this.deathSentenceTime = seconds
    this.locomotion.freeze()
    this.setState(BehavioralState.dead)
    this.sendMessage(message)
    this.clearItem()
  }

  setIsPiggy(isPiggy: boolean) {
    this.isPiggy = isPiggy
    this.updateAttackAndDefenseState()
  }

  sendMessage(message: string) {
    console.log('send mainhudmessage', message)
    this.client?.send('mainHUDMessage', message)
  }

  getGumpBalance() {
    return this.state.wootgumpBalance
  }

  incGumpBalance(amount: number) {
    if (amount !== 0) {
      this.client?.send('gumpDiff', amount)
    }

    this.state.wootgumpBalance += amount
  }

  setAdditionalSpeed() {
    const currentItem = this.currentItem()

    let additionalSpeed = 0
    if (currentItem?.speed) {
      additionalSpeed += currentItem.speed
    }
    if (this.isPiggy) {
      additionalSpeed -= 0.5
    }
    this.locomotion.setAdditionalSpeed(additionalSpeed)
  }

  getState():BehavioralState {
    return this.state.behavioralState
  }

  setState(state: BehavioralState) {
    console.log(this.id, "set state: ", state)
    this.state.behavioralState = state
    switch (state) {
      // case BehavioralState.move:
      //   this.setSpeedBasedOnDestination()
      //   return
      case BehavioralState.battle:
        this.sendMessage('Battle!')
        return
    }
  }

  isAlive() {
    return this.state.currentHealth > 0;
  }

  getHealth() {
    return this.state.currentHealth
  }

  setHealth(health:number) {
    return this.state.assign({
      currentHealth: health,
    })
  }

  currentAttack() {
    const item = this.currentItem()
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
    const item = this.currentItem()
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

  handleOtherWarriorCardPlay(warrior:Warrior, item:ItemDescription) {
    if (warrior === this) {
      return
    }
    //TODO: pop open a toast about the person playing a card
    this.sendMessage(`${warrior.name} played ${item.name}`)
    
    // see if that card cancels
    if (!this.state.currentItem) {
      return
    }
    if (item.cancels?.includes(this.state.currentItem.name.toLowerCase())) {
      this.sendMessage("Your card was canceled")
      this.clearItem()
    }
  }

  playItem(identifier:string): ItemDescription | null {
    const item = itemsByIdentifier[identifier]

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

    // remove the card from their inventory
    const idx = this.state.inventory.findIndex((i) => i.identifier === identifier)
    this.state.inventory.splice(idx, 1)

    // now add a new random one
    this.state.inventory.push(new Item(randomItem()))

    // if the item is a trap or equivalent (appliesToWorld), don't actually set it on the player
    if (item.appliesToWorld) {
      return item
    }
    this.setCurrentItem(identifier)
    return item
  }

  hasCard(item: ItemDescription) {
    const inventoryRecord = this.state.inventory.find((i) => i.identifier === item.identifier)
    if (!inventoryRecord) {
      return false
    }

    return true
  }

  private setCurrentItem(identifier:string) {
    log('setting item: ', identifier, ' existing: ', this.state.currentItem?.toJSON(), 'inventory', this.state.inventory.toJSON())
    // find it in the inventory
    const description = itemsByIdentifier[identifier]
    this.state.currentItem = new Item(description)
    this.updateAttackAndDefenseState()
  }

  private checkForCardTimeout() {
    const details = this.currentItem()
    if (details?.timeLimit && this.timeWithCard > details.timeLimit) {
      this.clearItem()
    }
  }

  private updateAttackAndDefenseState() {
    this.state.currentAttack = this.currentAttack()
    this.state.currentDefense = this.currentDefense()
  }

  currentItem() {
    if (!this.state.currentItem) {
      return null
    }
    return itemsByIdentifier[this.state.currentItem.identifier]
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
