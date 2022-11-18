import { AnimComponent, Entity, Vec3 } from "playcanvas";
import { createScript } from "../utils/createScriptDecorator";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import WarriorLocomotion from "./WarriorLocomotion";
import mustFindByName from "../utils/mustFindByName";
// import WarriorBehavior from "./WarriorBehavior";
import { State, Warrior } from "../syncing/schema/DelphsTableState";

@createScript("networkedWarriorController")
class NetworkedWarriorController extends ScriptTypeBase {
  locomotion: WarriorLocomotion
  state: State
  anim: AnimComponent

  initialize() {
    const locomotion = this.getScript<WarriorLocomotion>(this.entity, 'warriorLocomotion')
    if (!locomotion) {
      throw new Error('player controller requries locomotion')
    }
    this.locomotion = locomotion
    this.anim = mustFindByName(this.entity, 'viking').anim!
  }

  setState(newState:State) {
    if (this.state === newState) {
      return
    }
    console.log('set state: ', newState, this.entity.name)
    this.state = newState
    switch (newState) {
      case State.move:
        this.anim.setBoolean('battling', false)
        this.anim.setFloat('health', 100)
        return
      case State.taunt:
        //TODO this should be an animation, but for now idle it
        this.anim.setBoolean('battling', false)
        this.anim.setFloat('health', 100)
        return
      case State.dead:
        this.anim.setFloat('health', 0)
        this.anim.setBoolean('battling', false)
        return
      case State.battle:
        this.anim.setBoolean('battling', true)
        return
    }
  }

  setPlayer(player:Warrior) {
    console.log('player set', player.toJSON())
    this.entity.setPosition(player.position.x, 0, player.position.z)
    player.onChange = (changes) => {
      // console.log("changes: ", changes)
      this.locomotion.setSpeed(player.speed)
      this.setState(player.state)
    }
    player.destination.onChange = () => {
      // console.log("new destination: ", player.destination.toJSON())
      this.locomotion.setDestination(new Vec3(player.destination.x, 0, player.destination.z))
      // this.locomotion.setDestination(player.destination.x, player.destination.z)
    }
    player.position.onChange = () => {
      // console.log(' new position: ', player.position.toJSON())
      this.locomotion.setServerPosition(new Vec3(player.position.x, 0, player.position.z))
    }
    this.entity.fire('newWarrior', player)
  }
}

export default NetworkedWarriorController;
