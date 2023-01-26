import { Entity } from "playcanvas"
import { DelphsTableState } from "../syncing/schema/DelphsTableState"
import mustFindByName from "../utils/mustFindByName"
import vec2ToVec2 from "../utils/vec2ToVec2"

const QUEST_OBJECT_NAME = "quest-object"
const QUEST_OVER_EVT = "questOver"

class QuestLogic {
  app: pc.Application
  state: DelphsTableState
  battlers: Record<string,Entity>
  treasure?: Entity
  clock = 0

  constructor(app:pc.Application, state:DelphsTableState, battlers: Record<string,Entity>) {
    this.app = app
    this.state = state
    this.battlers = battlers
  }

  update(dt:number) {
    this.clock += dt
  }

  kind() {
    return this.state.currentQuest!.kind
  }

  piggy() {
    return this.battlers[this.state.currentQuest!.piggyId]
  }

  destroy() {
    console.log("destroying quest", this.treasure)
    this.treasure?.destroy()
    this.app.fire(QUEST_OVER_EVT)
    return
  }

  go() {
    if (!this.state.currentQuest) {
      throw new Error('go: should never happen, the quest is active, but there is no current quest')
    }
    const stopListening = this.state.currentQuest.listen("object", (object) => {
      if (this.treasure) {
        this.treasure.destroy()
      }
      console.log("quest object change: ", object)
      this.possiblySetupChest()
    })
    this.app.once(QUEST_OVER_EVT, stopListening)
    
    this.possiblySetupChest()

    this.app.fire("quest", this)
  }

  private possiblySetupChest() {
    if (!this.state.currentQuest) {
      throw new Error('setupCHest: should never happen, the quest is active, but there is no current quest')
    }

    if (!this.state.currentQuest.object) {
      return
    }

    mustFindByName(this.app.root, 'QuestSounds').sound!.slots['QuestStart'].play()
    const chest = mustFindByName(this.app.root, 'Chest').clone()
    chest.name = QUEST_OBJECT_NAME
    const position = vec2ToVec2(this.state.currentQuest.object.position)
    chest.setPosition(position.x, 0.03, position.y)
    this.app.root.addChild(chest)
    chest.enabled = true
    this.treasure = chest
  }

}

export default QuestLogic
