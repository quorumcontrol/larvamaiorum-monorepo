import { Entity, Vec3 } from "playcanvas";
import { createScript } from "../utils/createScriptDecorator";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import WarriorLocomotion from "./WarriorLocomotion";
import mustFindByName from "../utils/mustFindByName";
// import WarriorBehavior from "./WarriorBehavior";
import { Warrior } from "../syncing/schema/DelphsTableState";

@createScript("networkedWarriorController")
class NetworkedWarriorController extends ScriptTypeBase {
  locomotion: WarriorLocomotion

  initialize() {
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
    this.entity.fire('newWarrior', player)
  }
}

export default NetworkedWarriorController;
