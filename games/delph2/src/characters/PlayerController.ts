import { Entity } from "playcanvas";
import { createScript } from "../utils/createScriptDecorator";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import mustFindByName from "../utils/mustFindByName";
import QuestLogic from "../game/QuestLogic";
import { QuestType } from "../syncing/schema/DelphsTableState";

@createScript("playerController")
class PlayerController extends ScriptTypeBase {
  camera: Entity
  screen: Entity

  questArrow: Entity

  quest?: QuestLogic

  initialize() {
    this.camera = mustFindByName(this.app.root, 'Camera')
    this.screen = mustFindByName(this.entity, 'PlayerNameScreen')
    this.questArrow = mustFindByName(this.entity, "QuestArrow")
    this.questArrow.enabled = true
    this.app.on('questOver', this.handleQuestOver, this)
    this.app.on('quest', this.handleQuest, this)
  }

  handleQuest(quest: QuestLogic) {
    this.quest = quest
  }

  handleQuestOver() {
    this.quest = undefined
  }

  update() {
    const chasing = this.currentlyChasing()
    if (!chasing) {
      this.questArrow.enabled = false
      return
    }

    const position = chasing.getPosition()

    this.questArrow.enabled = true
    this.questArrow.lookAt(position.x, 0, position.z)
    this.questArrow.rotateLocal(0, 90, 0)
  }

  private currentlyChasing() {
    if (!this.quest) {
      return
    }
    switch (this.quest.kind()) {
      case QuestType.first:
        return this.quest.treasure
      case QuestType.keyCarrier:
        const piggy = this.quest.piggy()
        if (piggy === this.entity) {
          return this.quest.treasure
        }
        return piggy
    }

  }

}

export default PlayerController;
