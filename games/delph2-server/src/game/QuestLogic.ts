import { Quest, Quest as StateQuest, QuestObject, QuestObjectKind, QuestType, Vec2 } from '../rooms/schema/DelphsTableState'
import { randomUUID } from "crypto"
import { randomBounded, randomInt } from './utils/randoms'
import Warrior from './Warrior'
import vec2ToVec2 from './utils/vec2ToVec2'
import { Room } from 'colyseus'

function randomPosition() {
  return {
    x: randomBounded(37),
    z: randomBounded(37),
  }
}

class QuestLogic {
  room: Room
  state: StateQuest
  warriors: Record<string,Warrior>

  private _over = false

  winner?:Warrior

  static randomQuest(room:Room, warriors:Record<string,Warrior>, type: QuestType) {
    //TODO: actually random
    const questObj = new QuestObject({
      id: randomUUID(),
      kind: QuestObjectKind.chest,
    })
    questObj.position.assign(randomPosition())

    const state = new StateQuest({
      object: questObj,
      startedAt: new Date().getTime(),
    })

    const warriorIds = Object.keys(warriors)
    if (warriorIds.length > 1 && (type === QuestType.keyCarrier || (type === QuestType.random && randomInt(2) === 1))) {
      state.assign({
        kind: QuestType.keyCarrier,
        piggyId: warriorIds[randomInt(warriorIds.length)],
      })
      //TODO: make sure the goal isn't so close to the piggy
    }

    return new QuestLogic(room, state, warriors)
  }

  constructor(room:Room, state:StateQuest, warriors:Record<string, Warrior>) {
    this.state = state
    this.warriors = warriors
    this.room = room
  }

  start() {
    switch (this.state.kind) {
      case QuestType.first:
        this.room.broadcast("mainHUDMessage", "First to the prize wins!")
        return
      case QuestType.keyCarrier:
        const piggy = this.warriors[this.state.piggyId]
        Object.values(this.warriors).forEach((w) => {
          if (w === piggy) {
            return w.sendMessage("First to the prize wins. You have the key. Run!")
          }
          w.sendMessage(`${piggy.state.name} has the key. Get them.`)
        })
        return
    }
  }

  update(_dt:number) {
    Object.values(this.warriors).forEach((w) => {
      if (this.state.piggyId && w.id !== this.state.piggyId) {
        return
      }
      if (w.position.distance(vec2ToVec2(this.state.object.position)) <= 2) {
        this.winner = w
        this._over = true
      }
    })
  }

  updatePiggy(id:string) {
    const current = this.state.piggyId
    if (current) {
      this.warriors[current]?.sendMessage("You lost the key!")
    }
    this.state.assign({
      piggyId: id,
    })
    const newWarrior = this.warriors[id]
    newWarrior?.sendMessage("You have the key. Get to the prize.")
    Object.values(this.warriors).forEach((w) => {
      if ([newWarrior.id, current].includes(w.id)) {
        return
      }
      w.sendMessage(`${newWarrior.state.name} has the key. Get them.`)
    })
  }

  setNewRandomPiggy() {
    console.log("new random piggy")
    const ids = Object.keys(this.warriors)
    this.updatePiggy(ids[randomInt(ids.length)])
  }

  isOver() {
    return this._over
  }

}

export default QuestLogic
