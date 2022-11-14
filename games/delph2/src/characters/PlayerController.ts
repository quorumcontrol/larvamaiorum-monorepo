import { Entity, RaycastResult } from "playcanvas";
import { createScript } from "../utils/createScriptDecorator";
import { SELECT_EVT } from "../controls/CellSelector";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import WarriorLocomotion from "./WarriorLocomotion";
import mustFindByName from "../utils/mustFindByName";
import WarriorBehavior, { State } from "./WarriorBehavior";

@createScript("playerController")
class PlayerController extends ScriptTypeBase {

  camera: Entity
  arrow: Entity

  initialize() {
    const behavior = this.getScript<WarriorBehavior>(this.entity, 'warriorBehavior')!

    this.camera = mustFindByName(this.app.root, 'Camera')
    this.arrow = mustFindByName(this.entity, 'PlayerArrow')
    const locoMotion = this.getScript<WarriorLocomotion>(this.entity, 'warriorLocomotion')
    if (!locoMotion) {
      throw new Error('player controller requries locomotion')
    }
    this.app.on(SELECT_EVT, (result:RaycastResult) => {
      if (behavior.state !== State.move) {
        return
      }
      locoMotion.setDestination(result.point)
    })
  }

  update() {

  }

}

export default PlayerController;
