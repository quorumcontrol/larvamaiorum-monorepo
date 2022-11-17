import { Entity } from "playcanvas";
import { createScript } from "../utils/createScriptDecorator";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import WarriorLocomotion from "./WarriorLocomotion";
import mustFindByName from "../utils/mustFindByName";
import WarriorBehavior from "./WarriorBehavior";
import { Player } from "../syncing/schema/DelphsTableState";

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
  }

  setPlayer(player:Player) {
    player.onChange = (changes) => {
      console.log("changes: ", changes)
    }
  }

  // update() {

  // }

}

export default PlayerController;
