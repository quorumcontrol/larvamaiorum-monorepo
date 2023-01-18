import { Arch, Quest as StateQuest, QuestObject, QuestObjectKind, QuestType } from '../rooms/schema/DelphsTableState'
import { randomUUID } from "crypto"
import { randomInt } from './utils/randoms'
import vec2ToVec2 from './utils/vec2ToVec2'
import { Room } from 'colyseus'
import { Battler, BattlerType } from './BattleLogic2'
import { Vec2 } from 'playcanvas'

class QuestLogic {
  room: Room
  state: StateQuest
  battlers: Record<string, Battler>

  questObjectPosition?: Vec2

  static warriorIds(battlers:Record<string, Battler>) {
    return Object.keys(battlers).filter((id) => battlers[id].battlerType === BattlerType.warrior)
  }

  private _over = false

  winner?: Battler

  static matchQuest(room: Room, battlers: Record<string, Battler>, arches: Arch[], piggy: Battler) {
    //TODO: actually random
    const questObj = new QuestObject({
      id: randomUUID(),
      kind: QuestObjectKind.chest,
    })

    const state = new StateQuest({
      object: questObj,
      startedAt: new Date().getTime(),
    })

    state.assign({
      kind: QuestType.keyCarrier,
      piggyId: piggy.id,
    })

    const position = arches[randomInt(arches.length)].position
    questObj.position.assign(position.toJSON())

    return new QuestLogic(room, state, battlers)
  }

  static randomQuest(room: Room, battlers: Record<string, Battler>, arches: Arch[], type: QuestType) {
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
  })

  const warriorIds = QuestLogic.warriorIds(battlers)
  if (warriorIds.length > 1 && (type === QuestType.keyCarrier || (type === QuestType.random && randomInt(2) === 1))) {
    state.assign({
      kind: QuestType.keyCarrier,
      piggyId: warriorIds[randomInt(warriorIds.length)],
    })
    //TODO: make sure the goal isn't so close to the piggy
  }

  return new QuestLogic(room, state, battlers)
}

constructor(room: Room, state: StateQuest, battlers: Record<string, Battler>) {
  this.state = state
  this.battlers = battlers
  this.room = room
}

start() {
  this.questObjectPosition = vec2ToVec2(this.state.object.position)
  switch (this.state.kind) {
    case QuestType.first:
      this.room.broadcast("mainHUDMessage", "First to find the prize wins!")
      return
    case QuestType.keyCarrier:
      const piggy = this.battlers[this.state.piggyId]
      Object.values(this.battlers).forEach((w) => {
        if (w === piggy) {
          return w.sendMessage("First to the prize wins. You have the key. Run!")
        }
        w.sendMessage(`${piggy.name} has the key. Get them.`)
      })
      return
  }
}

update(_dt: number) {
  Object.values(this.battlers).forEach((battler) => {
    if (battler.battlerType !== BattlerType.warrior) {
      return
    }

    if (this.state.piggyId && battler.id !== this.state.piggyId) {
      return
    }
    if (battler.locomotion.position.distance(this.questObjectPosition) <= 2) {
      this.winner = battler
      this._over = true
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

}

export default QuestLogic
