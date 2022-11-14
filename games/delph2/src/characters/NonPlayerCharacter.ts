import { Entity, Vec3 } from "playcanvas";
import PlayingField from "../game/PlayingField";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";
import WarriorBehavior, { State } from "./WarriorBehavior";
import WarriorLocomotion, { ARRIVED_EVT } from "./WarriorLocomotion";

@createScript("nonPlayerCharacter")
class NonPlayerCharacter extends ScriptTypeBase {

  camera:Entity
  behavior:WarriorBehavior
  nameScreen:Entity
  name:Entity

  initialize() {
    this.behavior = this.getScript(this.entity, 'warriorBehavior')!

    const locoMotion = this.getScript<WarriorLocomotion>(this.entity, 'warriorLocomotion')
    if (!locoMotion) {
      throw new Error('player controller requries locomotion')
    }
    this.entity.on(ARRIVED_EVT, () => {
      if (this.behavior.state !== State.move) {
        return
      }
      locoMotion.randomDestination()
    })
    this.nameScreen = mustFindByName(this.entity, 'PlayerNameScreen')
    this.name = mustFindByName(this.nameScreen, 'PlayerName')
    this.camera = mustFindByName(this.app.root, 'Camera')
  }

  update() {
    if (!this.behavior.warrior) {
      return
    }
    this.name.element!.text = this.behavior.warrior.name
    this.nameScreen.lookAt(this.camera.getPosition())
    this.nameScreen.rotateLocal(0, 180, 0)

  }

}

export default NonPlayerCharacter;
