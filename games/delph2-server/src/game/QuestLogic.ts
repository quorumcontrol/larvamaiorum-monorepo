import { Quest, Quest as StateQuest, QuestObject, QuestObjectKind, QuestType, Vec2 } from '../rooms/schema/DelphsTableState'
import { randomUUID } from "crypto"
import { randomBounded, randomInt } from './utils/randoms'
import Warrior from './Warrior'
import vec2ToVec2 from './utils/vec2ToVec2'

function randomPosition() {
  return {
    x: randomBounded(37),
    z: randomBounded(37),
  }
}

class QuestLogic {
  state: StateQuest
  warriors: Record<string,Warrior>

  private _over = false

  winner?:Warrior

  static randomQuest(warriors:Record<string,Warrior>) {
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

    const warriorIds =  Object.keys(warriors)
    if (randomInt(2) == 1 && warriorIds.length > 1) {
      state.assign({
        kind: QuestType.keyCarrier,
        piggyId: warriorIds[randomInt(warriorIds.length)],
      })
    }

    return new QuestLogic(state, warriors)
  }

  constructor(state:StateQuest, warriors:Record<string, Warrior>) {
    this.state = state
    this.warriors = warriors
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
    this.state.assign({
      piggyId: id,
    })
  }

  setNewRandomPiggy() {
    const ids = Object.keys(this.warriors)
    const id = ids[randomInt(ids.length)]
    this.state.assign({
      piggyId: id,
    })
  }

  isOver() {
    return this._over
  }

}

export default QuestLogic
