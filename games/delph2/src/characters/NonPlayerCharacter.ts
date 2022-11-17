import { Entity } from "playcanvas";
import Warrior from "../game/Warrior";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";
import WarriorBehavior from "./WarriorBehavior";
import { State } from '../syncing/schema/DelphsTableState'
import WarriorLocomotion, { ARRIVED_EVT } from "./WarriorLocomotion";

@createScript("nonPlayerCharacter")
class NonPlayerCharacter extends ScriptTypeBase {

  camera:Entity
  behavior:WarriorBehavior
  nameScreen:Entity
  name:Entity
  statsScreen:Entity
  healthBar:Entity
  player: Entity

  warrior:Warrior


  initialize() {
    this.player = mustFindByName(this.app.root, 'Player')
    this.behavior = this.getScript(this.entity, 'warriorBehavior')!

    const locoMotion = this.getScript<WarriorLocomotion>(this.entity, 'warriorLocomotion')
    if (!locoMotion) {
      throw new Error('player controller requries locomotion')
    }
    // this.entity.on(ARRIVED_EVT, () => {
    //   if (this.behavior.state !== State.move) {
    //     return
    //   }
    //   locoMotion.randomDestination()
    // })
    this.nameScreen = mustFindByName(this.entity, 'PlayerNameScreen')
    this.statsScreen = mustFindByName(this.entity, 'StatsScreen')
    this.name = mustFindByName(this.nameScreen, 'PlayerName')
    this.camera = mustFindByName(this.app.root, 'Camera')
    this.healthBar = mustFindByName(this.nameScreen, 'HealthBar')
    this.entity.on('newWarrior', (warrior) => {
      this.name.element!.text = warrior.name
      this.warrior = warrior
    })
  }

  update() {
    if (!this.behavior.warrior) {
      return
    }

    if (this.entity.getPosition().distance(this.player.getPosition()) > 6) {
      this.statsScreen.enabled = false
    } else {
      this.statsScreen.enabled = true
      this.statsScreen.lookAt(this.camera.getPosition())
      this.statsScreen.rotateLocal(0, 180, 0)
      mustFindByName(this.statsScreen, 'Attack').element!.text = `A: ${this.warrior.currentAttack()}`
      mustFindByName(this.statsScreen, 'Defense').element!.text = `D: ${this.warrior.currentDefense()}`
      mustFindByName(this.statsScreen, 'Gump').element!.text = `G: ${this.warrior.wootgumpBalance}`

    }
  }

}

export default NonPlayerCharacter;
