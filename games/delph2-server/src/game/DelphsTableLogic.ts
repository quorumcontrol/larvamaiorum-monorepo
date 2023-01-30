import { Client, Room } from 'colyseus';
import { randomUUID } from 'crypto'
import { backOff } from 'exponential-backoff';
import { Vec2 } from "playcanvas";
import { DelphsTableState, Deer as DeerState, Warrior as WarriorState, Vec2 as StateVec2, Battle, BehavioralState, Item, Trap, RoomType, QuestType, RovingAreaAttack, BattlePhase, Arch, BattleControlMessage, GameNags } from "../rooms/schema/DelphsTableState";
import BattleLogic2, { Battler, BattlerType } from './BattleLogic2';
import Deer from './Deer';
import { InventoryItem, itemsByIdentifier } from './items';
import { getRandomTrack } from './music';
import QuestLogic from './QuestLogic';
import RovingAreaAttackLogic from './RovingAreaAttackLogic';
import randomPosition from './utils/randomPosition';
import { randomBounded, randomInt } from "./utils/randoms";
import Warrior, { WarriorStats } from "./Warrior";
import writeWinner from './winnerWriter';

type BattleList = Record<string, BattleLogic2> // guid to an existing battle

class DelphsTableLogic {
  room: Room
  state: DelphsTableState

  //sessionId to warrior
  warriors: Record<string, Warrior>
  wootgump: Record<string, Vec2>
  trees: Record<string, Vec2>
  deer: Record<string, Deer>

  battlers: Record<string, Battler>

  battles: BattleList
  rovingAttacks: Record<string,RovingAreaAttackLogic>

  currentQuest?: QuestLogic

  timeSinceMusic = 0

  timeSinceLastQuest = 0

  private playerQuorumHasArrived = false

  // for now assume a blank table at construction
  // TODO: handle a populated state with existing warriors, etc
  constructor(room: Room) {
    this.room = room
    this.state = room.state
    this.battlers = {}
    this.warriors = {}
    this.wootgump = {}
    this.trees = {}
    this.battles = {}
    this.deer = {}
    this.rovingAttacks = {}
  }

  start() {
    this.update(0)
    for (let i = 0; i < 10; i++) {
      this.spawnOneGump(this.randomPosition())
    }
    for (let i = 0; i < 80; i++) {
      const position = this.randomPosition()
      this.spawnTree(new Vec2(position.x, position.z))
    }
    for (let i = 0; i < 4; i++) {
      const position = this.randomPosition()
      this.spawnDeer(new Vec2(position.x, position.z))
    }
    for (let i = 0; i < 6; i++) {
      const arch = new Arch({
        rotation: randomInt(150)
      })
      arch.position.assign(this.randomPosition())
      this.room.state.arches.push(arch)
    }
    if (this.state.roomType === RoomType.continuous) {
      console.log("accepting input because continuous room")
      this.acceptInput()
    }
    this.setupMusic()
  }

  private acceptInput() {
    for (let i = 0; i < 2; i++) {
      this.spawnRovingAttack()
    }
    this.state.assign({
      acceptInput: true,
      persistantMessage: "",
    })
  }

  async setupMusic() {
    const track = await getRandomTrack()
    if (track) {
      console.log('updating track to: ', track.title)
      this.state.nowPlaying.assign({
        name: track.title,
        duration: track.duration,
        artwork: track.artwork,
        artist: track.artist,
        url: track.streaming,
        startedAt: new Date().getTime(),
      })
    }
    this.timeSinceMusic = 0
  }

  stop() {
    //todo
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
    this.handleRecovers(dt)
    Object.values(this.rovingAttacks).forEach((attack) => {
      attack.update(dt)
    })
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
    } 
    
    if (!this.currentQuest && this.state.acceptInput) {
      this.timeSinceLastQuest += dt
    }

    if (this.shouldStartQuest()) {
      this.startQuest()
    }
    if (this.currentQuest?.isOver()) {
      this.stopQuest()
    }
  }

  private shouldStartQuest() {
    if (this.state.currentQuest || !this.state.acceptInput) {
      return false
    }

    if (this.isMatchRoom()) {
      return true
    }

    return this.timeSinceLastQuest > 60 && (Math.floor(this.timeSinceLastQuest) % 10 === 0 && randomInt(10) === 1)
  }

  private isMatchRoom() {
    return this.state.roomType === RoomType.match
  }

  private hasRightNumberOfPlayers() {
    const warriorLength = Object.values(this.warriors).length
    if (this.state.playerCount) {
      return (warriorLength >= this.state.playerCount)
    }
    const expectedPlayers = Array.from(this.state.expectedPlayers.values())
    return warriorLength >= expectedPlayers.length
  }

  checkForPlayers() {
    if (this.state.roomType === RoomType.continuous || this.playerQuorumHasArrived) {
      return
    }
    if (!this.hasRightNumberOfPlayers()) {
      this.state.assign({
        acceptInput: false,
        persistantMessage: "Waiting for players."
      })
      return
    }
    console.log("accepting input because player quorum has arrived")

    this.playerQuorumHasArrived = true
    this.acceptInput()
    this.room.lock()
    this.room.broadcast('mainHUDMessage', "First to 50 gump gets the key. Go.")
  }

  addWarrior(stats: WarriorStats, client?: Client) {
    console.log('add warrior', stats)
    const sessionId = client?.sessionId || randomUUID()
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
    state.locomotion.assign({
      maxSpeed: stats.maxSpeed,
      walkSpeed: stats.walkSpeed,
    })
    state.locomotion.position.assign(position)
    state.locomotion.destination.assign(position)
    state.locomotion.focus.assign(position)
    stats.inventory.forEach((itemDescription) => {
      const item = new Item(itemDescription)
      state.inventory.push(item)
    })
    console.log('added warrior: ', state.name)
    const warrior = new Warrior(state, client)
    this.warriors[sessionId] = warrior 
    this.battlers[sessionId] = warrior
    this.state.warriors.set(sessionId, state)
    this.updateMaxStats()
  }

  removeWarrior(client: Client) {
    const sessionId = client.sessionId

    const warrior = this.warriors[sessionId]
    const battle = this.battles[warrior.id]
    if (battle) {
      battle.interruptAndTerminate()
    }

    delete this.warriors[sessionId]
    delete this.battlers[sessionId]
    
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
    if (this.warriors[sessionId]?.getState() === BehavioralState.move) {
      this.warriors[sessionId].locomotion.setDestinationAndFocus(x, z)
    }
  }

  playCard(sessionId: string, identifier: string) {
    if (!this.state.acceptInput) {
      return
    }
    if (this.currentQuest?.state.piggyId === this.warriors[sessionId]?.id) {
      this.warriors[sessionId].sendMessage("You have the key. No cards allowed.")
      return  
    }
    const warrior = this.warriors[sessionId]
    if (!warrior) {
      console.error('no warrior for ', sessionId)
      return
    }
    const result = warrior.playItem(identifier)

    if (!result) {
      return
    }

    if (result.name === "Trap") {
      this.setTrap(sessionId)
    }

    Object.values(this.warriors).forEach((w) => {
      w.handleOtherWarriorCardPlay(warrior, itemsByIdentifier[identifier])
    })

  }

  private setTrap(sessionId: string) {
    if (!this.state.acceptInput) {
      return
    }
    const warrior = this.warriors[sessionId]
    if (!warrior) {
      return
    }
    if (Array.from(this.state.traps.values()).length > 50) {
      warrior.sendMessage("No more traps allowed")
      return
    }
    const id = `trap-${randomUUID()}`
    const trap = new Trap({
      id,
      plantedBy: sessionId,
    })
    trap.position.assign({ x: warrior.locomotion.position.x, z: warrior.locomotion.position.y })
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
        if (deer.locomotion.position.distance(this.wootgump[gumpId]) < 0.7) {
          deer.incGumpBalance(1)
          delete this.wootgump[gumpId]
          this.state.wootgump.delete(gumpId)
        }
      })
    })

    Object.values(this.warriors).forEach((w) => {
      Object.keys(this.wootgump).forEach((gumpId) => {
        if (w.locomotion.position.distance(this.wootgump[gumpId]) < 0.7) {
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
        const distance = w.locomotion.position.distance(new Vec2(trap.position.x, trap.position.z))
        if (distance < 2) {
          console.log(w.state.name, 'trapped')
          w.dieForTime(2, `trapped by ${this.warriors[trap.plantedBy]?.state.name || "unknown"}`)
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
    if (!this.state.acceptInput) {
      return
    }
    const pairs: [Battler, Battler][] = []

    const battlers:Battler[] = (Object.values(this.warriors) as Battler[]).concat(Object.values(this.deer))

    battlers.forEach((battler) => {
      if (this.battles[battler.id] || ![BehavioralState.move, BehavioralState.chasing].includes(battler.getState())) {
        return
      }
      // otherwise find warriors we should battle
      battlers.forEach((potentialOpponent) => {
        if (potentialOpponent.id === battler.id || ![BehavioralState.move, BehavioralState.chasing].includes(potentialOpponent.getState())) {
          return
        }
        if (battler.battlerType === BattlerType.deer && potentialOpponent.battlerType == BattlerType.deer) {
          return // don't let two deer fight each other
        }

        if (battler.locomotion.position.distance(potentialOpponent.locomotion.position) >= 2) {
          return
        }

        // console.log("deer is: ", BattlerType.deer, "battler: ", battler.battlerType, "repels: ", battler.currentItem()?.repels, potentialOpponent.id)

        if (battler.currentItem()?.repels?.includes(GameNags.deer) && potentialOpponent.battlerType === BattlerType.deer) {
          return // don't let a deer fight someone with a repel card
        }

        if (battler.battlerType === BattlerType.deer && potentialOpponent.currentItem()?.repels?.includes(GameNags.deer)) {
          return // same as above, don't allow a deer to fight someone with a repel card.
        }

        // if we're in a quest situation, the deer should only attack the key holder
        if (battler.ignoreNonKeyHolder || potentialOpponent.ignoreNonKeyHolder && this.currentQuest?.state.piggyId) {
          if (![battler.id, potentialOpponent.id].includes(this.currentQuest?.state.piggyId)) {
            return
          }
        }
        
        pairs.push([battler, potentialOpponent])
      })
    })

    pairs.forEach((pair) => {
      if (pair.some((w) => this.battles[w.id])) {
        return // if any pair is already in battle, then skip
      }
      const id = `battle-${randomUUID()}`
      const state = new Battle({
        id,
        round: 0,
      })

      state.warriorIds.push(...pair.map((p) => p.id))
      // otherwise setup a battle
      const battle = new BattleLogic2(id, pair, state)
      pair.forEach((w) => {
        this.battles[w.id] = battle
      })
      this.state.battles.set(id, battle.state)
    })

    // start them all
    new Set(Object.values(this.battles)).forEach((battle) => {
      battle.update(dt) // update first so that new battles that are not started can ignore the time
      battle.go()
      if (battle.isPhase(BattlePhase.completed)) {
        console.log('battle complete')
        battle.battlers.forEach((w) => {
          delete this.battles[w.id]
        })
        this.state.battles.delete(battle.id)
        if (this.currentQuest) {
          this.currentQuest.processBattle(battle)
        }
      }
    })
  }

  private handleRecovers(_dt: number) {
    Object.values(this.warriors).forEach((w) => {
      if (w.state.behavioralState === BehavioralState.move) {
        w.recover(0.002)
      }
    })
  }

  updateBattleControl(client:Client, msg: BattleControlMessage) {
    const warrior = this.warriors[client.sessionId]
    if (!warrior) {
      console.error("no warrior found for ", client.sessionId)
      return
    }

    const battle = this.battles[warrior.id]
    if (!battle) {
      console.error('no battle for warrior: ', warrior.id, warrior.state.name)
      return
    }
    console.log(client.sessionId, "update battle controls, ", msg)

    battle.setControls(warrior.id, {
      regionalPosition: new Vec2(msg.region[0], msg.region[1]),
      attackDefenseSlider: msg.attackDefenseSlider
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

  private getQuest() {
    if (this.isMatchRoom()) {
      return QuestLogic.matchQuest(this.room, this.battlers, this.state.arches.toArray())
    }
    return QuestLogic.randomQuest(this.room, this.battlers, this.state.arches.toArray())
  }

  private startQuest() {
    const quest = this.getQuest()
    this.currentQuest = quest
    this.state.assign({
      questActive: true,
      currentQuest: quest.state,
    })
    if (quest.state.piggyId) {
      const warrior = this.warriors[quest.state.piggyId]
      warrior.clearItem()
      Object.values(this.deer).forEach((deer) => {
        deer.chase(warrior)
      })
    }
    quest.start()
  }

  private writeWinner(winner:string) {
    return backOff(() => {
      return writeWinner(this.state.matchId, winner)
    }, {
      numOfAttempts: 100,
      jitter: "full",
      timeMultiple: 5,
    })
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
        persistantMessage: `${winner.name} wins!`
      })
      console.log(this.state.matchId, "game over, writing winner")
      this.writeWinner(winner.id).catch((err) => {
        console.error("error writing winner", err)
      }).then((res) => {
        console.log("winner wrte, ", res)
      })
      return
    }

    this.room.broadcast('mainHUDMessage', 'Quest Over')

    if (winner) {
      winner.sendMessage("You win!")
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
    if (allGumps.length >= 60) {
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
    if (dimension < 0 && dimension < -28) {
      return -27
    }
    if (dimension > 27) {
      return dimension % 27
    }
    return dimension
  }

  private spawnTree(position: Vec2) {
    const id = `tree-${randomUUID()}`
    this.trees[id] = position
    this.state.trees.set(id, new StateVec2().assign({ x: position.x, z: position.y }))
  }

  private spawnRovingAttack() {
    const id = `roving-${randomUUID()}`
    const state = new RovingAreaAttack()
    this.rovingAttacks[id] = new RovingAreaAttackLogic(state, this.warriors)
    this.state.rovingAreaAttacks.set(id, state)
  }

  private spawnDeer(position: Vec2) {
    const id = `deer-${randomUUID()}`
    const deerState = new DeerState({
      id,
    })
    deerState.locomotion.assign({
      maxSpeed: 5,
      walkSpeed: 2,
    })
    deerState.locomotion.position.assign({
      x: position.x,
      z: position.y
    })
    const deer = new Deer(deerState, this.wootgump, this.warriors, this.state.traps)
    this.deer[id] = deer
    this.battlers[id] = deer
    this.state.deer.set(id, deerState)
  }

  randomPosition() {
    return randomPosition()
  }

}

export default DelphsTableLogic
