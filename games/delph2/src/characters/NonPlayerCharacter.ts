import { Entity, Vec3 } from "playcanvas";
import PlayingField from "../game/PlayingField";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";
import WarriorBehavior, { State } from "./WarriorBehavior";
import WarriorLocomotion, { ARRIVED_EVT } from "./WarriorLocomotion";

@createScript("nonPlayerCharacter")
class NonPlayerCharacter extends ScriptTypeBase {

  behavior:WarriorBehavior

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
  }

}

export default NonPlayerCharacter;
