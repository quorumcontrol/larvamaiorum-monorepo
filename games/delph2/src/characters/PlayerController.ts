import { Entity, Vec3 } from "playcanvas";
import { createScript } from "../utils/createScriptDecorator";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import WarriorLocomotion from "./WarriorLocomotion";
import mustFindByName from "../utils/mustFindByName";
// import WarriorBehavior from "./WarriorBehavior";
import { Warrior } from "../syncing/schema/DelphsTableState";

@createScript("playerController")
class PlayerController extends ScriptTypeBase {

  camera: Entity
  arrow: Entity
  locomotion: WarriorLocomotion

  initialize() {
    // const behavior = this.getScript<WarriorBehavior>(this.entity, 'warriorBehavior')!

    this.camera = mustFindByName(this.app.root, 'Camera')
    this.arrow = mustFindByName(this.entity, 'PlayerArrow')
    const locomotion = this.getScript<WarriorLocomotion>(this.entity, 'warriorLocomotion')
    if (!locomotion) {
      throw new Error('player controller requries locomotion')
    }
    this.locomotion = locomotion
  }

  setPlayer(player:Warrior) {
    console.log('player set', player.toJSON())
    this.entity.setPosition(player.position.x, 0, player.position.z)
    player.onChange = (changes) => {
      // console.log("changes: ", changes)
      this.locomotion.setSpeed(player.speed)
    }
    player.destination.onChange = () => {
      console.log("new destination: ", player.destination.toJSON())
      this.locomotion.setDestination(new Vec3(player.destination.x, 0, player.destination.z))
      // this.locomotion.setDestination(player.destination.x, player.destination.z)
    }
    player.position.onChange = () => {
      // console.log(' new position: ', player.position)
      this.locomotion.setServerPosition(new Vec3(player.position.x, 0, player.position.z))
    }
  }

  // update() {

  // }

}

export default PlayerController;
