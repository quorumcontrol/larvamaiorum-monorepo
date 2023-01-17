import { Entity } from "playcanvas";
import { createScript } from "../utils/createScriptDecorator";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import mustFindByName from "../utils/mustFindByName";
import QuestLogic from "../game/QuestLogic";
import { BehavioralState, QuestType, Warrior } from "../syncing/schema/DelphsTableState";
import mustGetScript from "../utils/mustGetScript";

@createScript("playerController")
class PlayerController extends ScriptTypeBase {
  camera: Entity
  screen: Entity

  warrior?: Warrior

  // footStepEntity:Entity
  // footStepEffect:any

  questArrow: Entity

  quest?: QuestLogic

  initialize() {
    this.camera = mustFindByName(this.app.root, 'Camera')
    this.screen = mustFindByName(this.entity, 'PlayerNameScreen')
    this.questArrow = mustFindByName(this.entity, "QuestArrow")
    this.questArrow.enabled = true
    this.app.on('questOver', this.handleQuestOver, this)
    this.app.on('quest', this.handleQuest, this)

    mustGetScript<any>(this.camera, 'orbitCamera2').focus(this.entity)


    // this.footStepEntity = mustFindByName(this.entity, "FootImpact")
    // this.footStepEffect = mustGetScript(this.footStepEntity, "effekseerEmitter")
    // mustFindByName(this.entity, "viking").anim?.on("foot_step", (_evt) => {
    //   console.log("foot step")
    //   // const foot = mustFindByName(this.entity, "foot_r")
    //   // this.footStepEntity.setPosition(foot.getPosition())
    //   this.footStepEffect.play()
    // })
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

    this.questArrow.enabled = (this.warrior?.behavioralState === BehavioralState.move)
    this.questArrow.lookAt(position.x, 0, position.z)
    this.questArrow.rotateLocal(0, 90, 0)
  }

  setWarrior(warrior:Warrior) {
    this.warrior = warrior
  }

  private currentlyChasing() {
    if (!this.quest) {
      return
    }
    switch (this.quest.kind()) {
      case QuestType.first:
        // return this.quest.treasure
        return
      case QuestType.keyCarrier:
        const piggy = this.quest.piggy()
        if (piggy === this.entity) {
          return // don't point at the treasure
        }
        return piggy
    }

  }

}

export default PlayerController;
