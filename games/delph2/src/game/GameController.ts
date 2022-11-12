import { Entity, Vec3 } from "playcanvas";
import NonPlayerCharacter from "../characters/NonPlayerCharacter";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";
import PlayingField from "./PlayingField";

@createScript("gameController")
class GameController extends ScriptTypeBase {

  field: Entity
  playingField: PlayingField

  npcTemplate: Entity

  initialize() {
    this.field = mustFindByName(this.app.root, 'gameBoard')
    this.playingField = this.getScript(this.field, 'playingField')!
    this.npcTemplate = mustFindByName(this.app.root, 'NPC')
    this.setup()
  }

  setup() {
    for (let i = 0; i < 10; i++) {
      const character = this.npcTemplate.clone()
      character.enabled = true
      this.app.root.addChild(character)
      console.log(character)
      const position = this.playingField.randomPosition()

      console.log("cloning", position)
      character.setPosition(position.x, 0, position.z)
      const script = this.getScript<NonPlayerCharacter>(character, 'nonPlayerCharacter')
      setTimeout(() => {
        const position = this.playingField.randomPosition().mulScalar(1.25)
        position.y = 0
        script?.setDestination(position)
      }, 100)
    }
    const gumpTemplate = mustFindByName(this.app.root, 'wootgump')

    for (let i = 0; i < 100; i++) {
      const gump = gumpTemplate.clone()
      gump.enabled = true
      this.app.root.addChild(gump)
      const position = this.playingField.randomPosition().mulScalar(1.25)
      gump.setPosition(position.x, 0, position.z)
    }

  }

}

export default GameController;
