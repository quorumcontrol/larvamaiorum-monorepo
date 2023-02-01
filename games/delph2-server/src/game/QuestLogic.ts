import { Arch, Quest as StateQuest, QuestObject, QuestObjectKind, QuestType } from '../rooms/schema/DelphsTableState'
import { randomUUID } from "crypto"
import { randomInt } from './utils/randoms'
import vec2ToVec2 from './utils/vec2ToVec2'
import { Room } from 'colyseus'
import BattleLogic2, { Battler, BattlerType } from './BattleLogic2'
import { Vec2 } from 'playcanvas'

class QuestLogic {
  room: Room
  state: StateQuest
  battlers: Record<string, Battler>
  arches: Arch[]

  questObjectPosition?: Vec2

  static warriorIds(battlers: Record<string, Battler>) {
    return Object.keys(battlers).filter((id) => battlers[id].battlerType === BattlerType.warrior)
  }

  private _over = false

  winner?: Battler

  consecutiveBattles: Record<string, number>

  static matchQuest(room: Room, battlers: Record<string, Battler>, arches: Arch[]) {
    //TODO: actually random
    // const questObj = new QuestObject({
    //   id: randomUUID(),
    //   kind: QuestObjectKind.chest,
    // })

    const state = new StateQuest({
      // object: questObj,
      description: "First warrior to get 50 gump and win 2 consecutive battles against another player gets they key. First one to exit with the key wins.",
      startedAt: new Date().getTime(),
    })

    state.assign({
      kind: QuestType.keyCarrier,
    })

    // const position = arches[randomInt(arches.length)].position
    // questObj.position.assign(position.toJSON())

    return new QuestLogic(room, state, battlers, arches)
  }

  static randomQuest(room: Room, battlers: Record<string, Battler>, arches: Arch[]) {
    //TODO: actually random
    const questObj = new QuestObject({
      id: randomUUID(),
      kind: QuestObjectKind.chest,
    })
    const position = arches[randomInt(arches.length)].position

    questObj.position.assign(position.toJSON())

    const state = new StateQuest({
      object: questObj,
      startedAt: new Date().getTime(),
      type: QuestType.first,
      description: "First to the exit wins."
    })

    return new QuestLogic(room, state, battlers, arches)
  }

  constructor(room: Room, state: StateQuest, battlers: Record<string, Battler>, arches: Arch[]) {
    this.state = state
    this.battlers = battlers
    this.room = room
    this.consecutiveBattles = {}
    this.arches = arches
  }

  start() {
    if (this.state.object) {
      this.questObjectPosition = vec2ToVec2(this.state.object.position)
    }
    switch (this.state.kind) {
      case QuestType.first:
        this.room.broadcast("mainHUDMessage", "First to find the prize wins!")
        return
      case QuestType.keyCarrier:
        // for now do nothing
        return
    }
  }

  update(_dt: number) {
    if (this.state.kind === QuestType.first || this.state.piggyId) {
      Object.values(this.battlers).forEach((battler) => {
        if (battler.battlerType !== BattlerType.warrior) {
          return
        }
  
        if (this.state.piggyId && battler.id !== this.state.piggyId) {
          return
        }
        if (!this.questObjectPosition) {
          console.error('no quest object position yet', this.state.piggyId)
          return
        }
        if (battler.locomotion.position.distance(this.questObjectPosition) <= 2) {
          console.log("quest complete: ", battler.name, "wins")
          this.winner = battler
          this._over = true
        }
      })
    }

    if (this.state.kind !== QuestType.keyCarrier || this.state.piggyId) {
      return
    }
    // that means we are still trying to see if there's a piggy.
    const requisitesCompleted = this.warriorWithAllTheThings()
    if (requisitesCompleted) {
      console.log("quest is ready to run")
      const questObj = new QuestObject({
        id: randomUUID(),
        kind: QuestObjectKind.chest,
      })
        
      const position = this.arches[randomInt(this.arches.length)].position
      questObj.position.assign(position.toJSON())

      this.state.assign({
        object: questObj,
      })
      this.questObjectPosition = vec2ToVec2(this.state.object.position)

      this.updatePiggy(requisitesCompleted.id)
    }

  }

  processBattle(battle: BattleLogic2) {
    // keep track of consecutive battles for human warriors (not the deer)
    if (battle.losers.concat([battle.winner!]).every((b) => b && b.battlerType == BattlerType.warrior)) {
      this.consecutiveBattles[battle.winner.id] ||= 0
      this.consecutiveBattles[battle.winner.id]++
      battle.losers.forEach((l) => {
        this.consecutiveBattles[l.id] ||= 0
        const current = this.consecutiveBattles[l.id]
        this.consecutiveBattles[l.id] = Math.max(0, current - 1)
      })
    }

    if (!this.state.piggyId) {
      return
    }
    const piggyId = this.state.piggyId
    const winner = battle.winner!
    if (winner.id === piggyId) {
      return // do nothing because the winner stays the piggy.
    }
    battle.losers.forEach((w) => {
      if (w.id === piggyId) {
        this.updatePiggy(winner.id)
      }
    })
  }

  private warriorIds() {
    return Object.keys(this.battlers).filter((id) => this.battlers[id].battlerType === BattlerType.warrior)
  }

  updatePiggy(id: string) {
    const current = this.state.piggyId
    if (current) {
      this.battlers[current]?.sendMessage("You lost the key!")
      this.battlers[current]?.setIsPiggy(false)
    }
    this.state.assign({
      piggyId: id,
    })
    const newWarrior = this.battlers[id]
    newWarrior.setIsPiggy(true)

    newWarrior?.sendMessage("You have the key. Get to the prize.")
    Object.values(this.battlers).forEach((w) => {
      if ([newWarrior.id, current].includes(w.id)) {
        return
      }
      w.sendMessage(`${newWarrior.name} has the key. Get them.`)
    })
  }

  setNewRandomPiggy() {
    console.log("new random piggy")
    const ids = this.warriorIds()
    this.updatePiggy(ids[randomInt(ids.length)])
  }

  isOver() {
    return this._over
  }

  private warriorWithAllTheThings() {
    return Object.values(this.battlers).find((w) => {
      return w.getGumpBalance() >= 50 && (this.consecutiveBattles[w.id] || 0) >= 2
    })
  }

}

export default QuestLogic
