import { Entity } from "playcanvas"
import { DelphsTableState } from "../syncing/schema/DelphsTableState"
import mustFindByName from "../utils/mustFindByName"
import vec2ToVec2 from "../utils/vec2ToVec2"

const QUEST_OBJECT_NAME = "quest-object"
const QUEST_OVER_EVT = "questOver"

class QuestLogic {
  app: pc.Application
  state: DelphsTableState
  warriors: Record<string,Entity>
  treasure?: Entity
  clock = 0

  constructor(app:pc.Application, state:DelphsTableState, warriors: Record<string,Entity>) {
    this.app = app
    this.state = state
    this.warriors = warriors
  }

  update(dt:number) {
    this.clock += dt
  }

  kind() {
    return this.state.currentQuest!.kind
  }

  piggy() {
    return this.warriors[this.state.currentQuest!.piggyId]
  }

  destroy() {
    console.log("destroying quest", this.treasure)
    const start = this.treasure!.getLocalPosition()
    this.treasure!.tween(start).to({x: start.x, y: -20, z: start.z}, 0.2).start().on('complete', () => {
      this.treasure?.destroy()
    })
    this.app.fire(QUEST_OVER_EVT)
    return
  }

  go() {
    if (!this.state.currentQuest) {
      throw new Error('should never happen, the quest is active, but there is no current quest')
    }
    mustFindByName(this.app.root, 'QuestSounds').sound!.slots['QuestStart'].play()
    const chest = mustFindByName(this.app.root, 'Chest').clone()
    chest.name = QUEST_OBJECT_NAME
    const position = vec2ToVec2(this.state.currentQuest.object.position)
    chest.setPosition(position.x, 0.03, position.y)
    this.app.root.addChild(chest)
    chest.enabled = true
    this.treasure = chest

    this.app.fire("quest", this)
  }

}

export default QuestLogic
