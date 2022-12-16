import { Entity } from "playcanvas";
import {Warrior} from "../syncing/schema/DelphsTableState";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";

@createScript("nonPlayerCharacter")
class NonPlayerCharacter extends ScriptTypeBase {

  camera:Entity
  nameScreen:Entity
  name:Entity
  statsScreen:Entity
  healthBar:Entity
  
  player?: Entity
  warrior?: Warrior

  stats: {
    Attack: Entity,
    Defense: Entity,
    Gump: Entity
  }

  initialize() {
    this.nameScreen = mustFindByName(this.entity, 'PlayerNameScreen')
    this.statsScreen = mustFindByName(this.entity, 'StatsScreen')
    this.name = mustFindByName(this.nameScreen, 'PlayerName')
    this.camera = mustFindByName(this.app.root, 'Camera')
    this.healthBar = mustFindByName(this.nameScreen, 'HealthBar')
    this.entity.on('newWarrior', (warrior) => {
      this.name.element!.text = warrior.name
      this.warrior = warrior
    })
    this.stats = {
      Attack: mustFindByName(this.statsScreen, "Attack"),
      Defense: mustFindByName(this.statsScreen, "Defense"),
      Gump: mustFindByName(this.statsScreen, "Gump"),
    }
  }

  setPlayerEntity(player:Entity) {
    this.player = player
  }

  update() {
    if (!this.player) {
      this.statsScreen.enabled = false
      return
    }

    if (this.entity.getPosition().distance(this.player.getPosition()) > 6) {
      this.statsScreen.enabled = false
    } else {
      this.statsScreen.enabled = true
      this.statsScreen.lookAt(this.camera.getPosition())
      this.statsScreen.rotateLocal(0, 180, 0)
      if (this.warrior) {
        this.stats.Attack.element!.text = `A: ${this.warrior.attack}`
        this.stats.Defense.element!.text = `D: ${this.warrior.defense}`
        this.stats.Gump.element!.text = `G: ${this.warrior.wootgumpBalance}`
      }
    }
  }

}

export default NonPlayerCharacter;
