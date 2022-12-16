import { Client, Room } from 'colyseus';
import { randomUUID } from 'crypto'
import { Vec2 } from "playcanvas";
import { DelphsTableState, Deer as DeerState, Warrior as WarriorState, Vec2 as StateVec2, Battle, State, DeerAttack, InventoryOfItem, Item, Trap, RoomType, QuestType } from "../rooms/schema/DelphsTableState";
import BattleLogic from './BattleLogic';
import Deer from './Deer';
import DeerAttackLogic from './DeerAttackLogic';
import { InventoryItem, itemFromInventoryItem } from './items';
import { getRandomTrack } from './music';
import QuestLogic from './QuestLogic';
import iterableToArray from './utils/iterableToArray';
import { randomBounded, randomInt } from "./utils/randoms";
import Warrior, { WarriorStats } from "./Warrior";

type BattleList = Record<string, BattleLogic> // guid to an existing battle

class DelphsTableLogic {
  room: Room
  state: DelphsTableState

  intervalHandle?: any

  warriors: Record<string, Warrior>
  wootgump: Record<string, Vec2>
  trees: Record<string, Vec2>
  deer: Record<string, Deer>
  battles: BattleList
  deerAttacks: Record<string, DeerAttackLogic>

  currentQuest?: QuestLogic

  timeSinceMusic = 0

  timeSinceLastQuest = 0

  private playerQuorumHasArrived = false

  // for now assume a blank table at construction
  // TODO: handle a populated state with existing warriors, etc
  constructor(room: Room) {
    this.room = room
    this.state = room.state

    this.warriors = {}
    this.wootgump = {}
    this.trees = {}
    this.battles = {}
    this.deer = {}
    this.deerAttacks = {}
  }

  start() {
    let previous = new Date()
    this.update(0)
    this.intervalHandle = setInterval(() => {
      const now = new Date()
      const diff = (now.getTime()) - previous.getTime()
      previous = now
      this.update(diff / 1000)
    }, 100)
    for (let i = 0; i < 10; i++) {
      this.spawnOneGump(this.randomPosition())
    }
    for (let i = 0; i < 80; i++) {
      const position = this.randomPosition()
      this.spawnTree(new Vec2(position.x, position.z))
    }
    for (let i = 0; i < 10; i++) {
      const position = this.randomPosition()
      this.spawnDeer(new Vec2(position.x, position.z))
    }
    if (this.state.roomType === RoomType.continuous) {
      this.state.assign({
        acceptInput: true
      })
    }
    this.setupMusic()
  }

  async setupMusic() {
    const track = await getRandomTrack()
    if (track) {
      console.log('updating track to: ', track.title)
      this.state.nowPlaying.assign({
        name: track.title,
        duration: track.duration,
        artwork: track.artwork,
        url: track.streaming,
        startedAt: new Date().getTime()
      })
    }
    this.timeSinceMusic = 0
  }

  stop() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle)
    }
  }

  update(dt: number) {
    Object.values(this.warriors).forEach((w) => {
      w.update(dt)
    })
    Object.values(this.deer).forEach((d) => {
      d.update(dt)
    })
    this.checkForPlayers()
    this.checkForTraps()
    this.spawnGump()
    this.checkForHarvest()
    this.handleBattles(dt)
    this.handleDeerAttacks(dt)
    this.handleRecovers(dt)
    this.timeSinceMusic += dt
    if (this.state.nowPlaying.duration === 0 && this.timeSinceMusic > 20) {
      // try every 20s incase music is failing
      this.timeSinceMusic = 0
      this.setupMusic()
    }
    if (this.state.nowPlaying.duration > 0 && this.timeSinceMusic > this.state.nowPlaying.duration) {
      this.timeSinceMusic = 0
      this.setupMusic()
    }

    if (this.currentQuest) {
      this.currentQuest.update(dt)
    } else {
      this.timeSinceLastQuest += dt
    }
    if (this.state.acceptInput && !this.state.currentQuest && this.timeSinceLastQuest > 60 && (this.isMatchRoom() || Math.floor(this.timeSinceLastQuest) % 10 === 0 && randomInt(10) === 1)) {
      this.startQuest()
    }
    if (this.currentQuest?.isOver()) {
      this.stopQuest()
    }
  }

  private isMatchRoom() {
    return this.state.roomType === RoomType.match
  }

  checkForPlayers() {
    if (this.state.roomType === RoomType.continuous || this.playerQuorumHasArrived) {
      return
    }
    const expectedPlayers = iterableToArray(this.state.expectedPlayers.values())
    if (Object.values(this.warriors).length < expectedPlayers.length) {
      this.state.assign({
        acceptInput: false,
        persistantMessage: "Waiting for players."
      })
      return
    }

    this.playerQuorumHasArrived = true
    this.state.assign({
      acceptInput: true,
      persistantMessage: "",
    })
  }

  addWarrior(client: Client, stats: WarriorStats) {
    console.log('add warrior', stats)
    const sessionId = client.sessionId
    const position = this.randomPosition()
    const state = new WarriorState({
      ...stats,
      currentAttack: stats.attack,
      currentDefense: stats.defense,
      id: sessionId,
      speed: 0,
      wootgumpBalance: stats.initialGump,
      currentHealth: stats.initialHealth,
    })
    state.position.assign(position)
    state.destination.assign(position)
    Object.keys(stats.initialInventory).forEach((key) => {
      const initialInventory = stats.initialInventory[key]
      const itemDescription = itemFromInventoryItem(initialInventory.item)
      const item = new Item({
        ...initialInventory.item,
        name: itemDescription.name,
        description: itemDescription.description,
      })
      const inventoryOfItem = new InventoryOfItem({ quantity: initialInventory.quantity, item: item })
      state.initialInventory.set(key, inventoryOfItem)
      state.inventory.set(key, inventoryOfItem.clone())
    })
    console.log('added warrior: ', state.name)
    this.warriors[sessionId] = new Warrior(client, state)
    this.state.warriors.set(sessionId, state)
    this.updateMaxStats()
  }

  removeWarrior(client: Client) {
    const sessionId = client.sessionId
    delete this.warriors[sessionId]
    this.state.warriors.delete(sessionId)
    if (this.currentQuest && this.currentQuest.state.piggyId === sessionId) {
      console.log('warrior leaving was the piggy')
      this.currentQuest.setNewRandomPiggy()
    }
    this.updateMaxStats()
  }

  updateDestination(sessionId: string, { x, z }: { x: number, z: number }) {
    if (!this.state.acceptInput) {
      return
    }
    this.warriors[sessionId].setDestination(x, z)
  }

  playCard(sessionId: string, item: InventoryItem) {
    if (!this.state.acceptInput) {
      return
    }
    const result = this.warriors[sessionId]?.playItem(item)
    if (result?.name === "Trap") {
      this.setTrap(sessionId)
    }
  }

  private setTrap(sessionId: string) {
    if (!this.state.acceptInput) {
      return
    }
    const warrior = this.warriors[sessionId]
    if (!warrior) {
      return
    }
    if (iterableToArray(this.state.traps.values()).length > 50) {
      warrior.sendMessage("No more traps allowed")
      return
    }
    const id = randomUUID()
    const trap = new Trap({
      id,
      plantedBy: sessionId,
    })
    trap.position.assign({ x: warrior.position.x, z: warrior.position.y })
    this.state.traps.set(id, trap)
  }

  spawnOneGump(position: { x: number, z: number }) {
    const id = randomUUID()
    this.wootgump[id] = new Vec2(position.x, position.z)
    this.state.wootgump.set(id, new StateVec2().assign(position))
  }

  checkForHarvest() {
    // let the deer feed first
    Object.values(this.deer).forEach((deer) => {
      Object.keys(this.wootgump).forEach((gumpId) => {
        if (deer.position.distance(this.wootgump[gumpId]) < 0.7) {
          delete this.wootgump[gumpId]
          this.state.wootgump.delete(gumpId)
        }
      })
    })

    Object.values(this.warriors).forEach((w) => {
      Object.keys(this.wootgump).forEach((gumpId) => {
        if (w.position.distance(this.wootgump[gumpId]) < 0.7) {
          w.incGumpBalance(1)
          delete this.wootgump[gumpId]
          this.state.wootgump.delete(gumpId)
        }
      })
    })
  }

  checkForTraps() {
    Object.values(this.warriors).forEach((w) => {
      for (const [id, trap] of this.state.traps.entries()) {
        if (trap.plantedBy === w.id) {
          return
        }
        const distance = w.position.distance(new Vec2(trap.position.x, trap.position.z))
        if (distance < 0.9) {
          console.log(w.state.name, 'trapped')
          w.state.assign({
            currentHealth: w.state.currentHealth * 0.5
          })
          const gumpToLose = Math.floor(w.state.wootgumpBalance * 0.1)
          w.incGumpBalance(-1 * gumpToLose)
          if (trap.plantedBy && this.warriors[trap.plantedBy]) {
            this.warriors[trap.plantedBy].incGumpBalance(gumpToLose)
          }
          if (this.currentQuest && this.currentQuest.state.piggyId === w.id) {
            this.currentQuest.updatePiggy(trap.plantedBy)
          }
          // w.client.send('trapped', id)
          this.state.traps.delete(id)
        }
      }
    })
  }

  handleBattles(dt: number) {
    const pairs: [Warrior, Warrior][] = []

    const warriors = Object.values(this.warriors)

    warriors.forEach((w) => {
      if (this.battles[w.id]) {
        return
      }
      // otherwise find warriors we should battle
      warriors.forEach((potentialOpponent) => {
        if (potentialOpponent.id === w.id) {
          return
        }
        if (w.position.distance(potentialOpponent.position) < 1) {
          pairs.push([w, potentialOpponent])
        }
      })
    })

    pairs.forEach((pair) => {
      if (pair.some((w) => this.battles[w.id])) {
        return // if any pair is already in battle, then skip
      }
      const id = randomUUID()
      const state = new Battle({
        id
      })
      state.warriorIds.push(...pair.map((p) => p.id))
      // otherwise setup a battle
      const battle = new BattleLogic(id, pair, state)
      pair.forEach((w) => {
        this.battles[w.id] = battle
      })
      this.state.battles.set(id, battle.state)
    })

    // start them all
    new Set(Object.values(this.battles)).forEach((battle) => {
      battle.update(dt) // update first so that new battles that are not started can ignore the time
      battle.go()
      if (battle.completed) {
        console.log('battle complete')
        battle.warriors.forEach((w) => {
          delete this.battles[w.id]
        })
        this.state.battles.delete(battle.id)
        if (this.currentQuest && this.currentQuest.state.piggyId) {
          const piggyId = this.currentQuest.state.piggyId
          const winner = battle.winner!
          if (winner.id === piggyId) {
            return // do nothing because the winner stays the piggy.
          }
          battle.losers.forEach((w) => {
            if (w.id === piggyId) {
              this.currentQuest.updatePiggy(winner.id)
            }
          })
        }
      }
    })
  }

  handleRecovers(_dt: number) {
    Object.values(this.warriors).forEach((w) => {
      if (w.state.state === State.move) {
        w.recover(0.005)
      }
    })
  }

  handleDeerAttacks(dt: number) {
    const eligibleDeer = Object.values(this.deer).filter((d) => [State.move, State.chasing].includes(d.state.state))
    const eligibleWarriors = Object.values(this.warriors).filter((w) => w.state.state === State.move)
    eligibleDeer.forEach((deer) => {
      eligibleWarriors.forEach((w) => {
        // skip over already assigned warriors
        if (w.state.state !== State.move) {
          return
        }
        if (deer.position.distance(w.position) <= 0.6) {
          console.log('deer close, setting up attack')
          const id = randomUUID()
          const attackState = new DeerAttack({
            id,
            warriorId: w.id,
            deerId: deer.id
          })
          this.state.deerAttacks.set(id, attackState)
          const attack = new DeerAttackLogic(id, deer, w)
          this.deerAttacks[id] = attack
          attack.go()
        }
      })
    })

    Object.values(this.deerAttacks).forEach((attack) => {
      attack.update(dt)
      if (attack.complete) {
        this.state.deerAttacks.delete(attack.id)
        delete this.deerAttacks[attack.id]
      }
    })
  }

  private updateMaxStats() {
    let maxAttack = 0
    let maxDefense = 0
    let maxHealth = 0
    Object.values(this.warriors).forEach((w) => {
      if (w.state.attack > maxAttack) {
        maxAttack = w.state.attack
      }
      if (w.state.defense > maxDefense) {
        maxDefense = w.state.defense
      }
      if (w.state.initialHealth > maxHealth) {
        maxHealth = w.state.initialHealth
      }
    })
    this.state.maxStats.assign({
      maxAttack,
      maxDefense,
      maxHealth,
    })
  }

  private startQuest() {
    const type = (this.state.roomType === RoomType.continuous) ? QuestType.random : QuestType.keyCarrier
    const quest = QuestLogic.randomQuest(this.room, this.warriors, type)
    this.currentQuest = quest
    this.state.assign({
      questActive: true,
      currentQuest: quest.state,
    })
    quest.start()
  }

  private stopQuest() {

    const winner = this.currentQuest.winner
    this.currentQuest = undefined
    this.state.assign({
      questActive: false,
      currentQuest: undefined
    })
    this.timeSinceLastQuest = 0

    if (this.isMatchRoom()) {
      this.state.assign({
        acceptInput: false,
        persistantMessage: `${winner.state.name} wins!`
      })
      return
    }

    this.room.broadcast('mainHUDMessage', 'Quest Over')

    if (winner) {
      winner.client.send('mainHUDMessage', "You win!")
      Object.values(this.warriors).forEach((w) => {
        if (w === winner) {
          return
        }
        w.sendMessage("You lose.")
      })
    }
  }

  private spawnGump() {
    const allGumps = Object.values(this.wootgump)
    if (allGumps.length >= 70) {
      return
    }
    allGumps.forEach((gump, i) => {
      if (randomInt(100) <= 5) {
        const xDiff = randomBounded(6)
        const zDiff = randomBounded(6)
        const x = this.positionModulo(gump.x + xDiff)
        const z = this.positionModulo(gump.y + zDiff)
        this.spawnOneGump({ x, z })
      }
    })
    // now let's see if we get a new area too
    if (randomInt(100) <= 10) {
      this.spawnOneGump(this.randomPosition())
    }
  }

  private positionModulo(dimension: number) {
    if (dimension < 0 && dimension < 37) {
      return 36
    }
    if (dimension > 37) {
      return dimension % 35
    }
    return dimension
  }

  private spawnTree(position: Vec2) {
    const id = randomUUID()
    this.trees[id] = position
    this.state.trees.set(id, new StateVec2().assign({ x: position.x, z: position.y }))
  }

  private spawnDeer(position: Vec2) {
    const id = randomUUID()
    const deerState = new DeerState()
    deerState.position.assign({
      x: position.x,
      z: position.y
    })
    const deer = new Deer(deerState, this.wootgump, this.warriors, this.state.traps)
    this.deer[id] = deer
    this.state.deer.set(id, deerState)
  }

  randomPosition() {
    return {
      x: randomBounded(37),
      z: randomBounded(37),
    }
  }


}

export default DelphsTableLogic
