import { randomInt } from "../utils/randoms";
import { Entity } from "playcanvas";
import WarriorLocomotion from "../characters/WarriorLocomotion";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";
import PlayingField from "./PlayingField";

@createScript("gameController")
class GameController extends ScriptTypeBase {

  field: Entity
  gumpTemplate: Entity
  playingField: PlayingField

  npcTemplate: Entity

  initialize() {
    this.gumpTemplate = mustFindByName(this.app.root, 'wootgump')

    this.field = mustFindByName(this.app.root, 'gameBoard')
    this.playingField = this.getScript(this.field, 'playingField')!
    this.npcTemplate = mustFindByName(this.app.root, 'NPC')
    this.setup()
  }

  update() {
    if (randomInt(1000) < 24) {
      this.spawnGump()
    }
  }

  setup() {
    for (let i = 0; i < 10; i++) {
      const character = this.npcTemplate.clone()
      character.enabled = true
      this.app.root.addChild(character)
      const position = this.playingField.randomPosition()

      character.setPosition(position.x, 0, position.z)
      const script = this.getScript<WarriorLocomotion>(character, 'warriorLocomotion')
      setTimeout(() => {
        const position = this.playingField.randomPosition().mulScalar(1.25)
        position.y = 0
        script!.setDestination(position)
      }, 100)
    }

    for (let i = 0; i < 10; i++) {
      this.spawnGump()
    }

  }

  private spawnGump() {
    const gump = this.gumpTemplate.clone()
    gump.enabled = true
    this.app.root.addChild(gump)
    const position = this.playingField.randomPosition().mulScalar(1.25)
    gump.setPosition(position.x, 0, position.z)
  }

}

export default GameController;
