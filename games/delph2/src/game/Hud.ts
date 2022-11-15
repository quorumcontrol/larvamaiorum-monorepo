import { Entity } from 'playcanvas'
import WarriorBehavior from '../characters/WarriorBehavior';
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";
import mustGetScript from '../utils/mustGetScript';
import Warrior from "./Warrior";


@createScript("hud")
class Hud extends ScriptTypeBase {
  warrior?:Warrior

  name: Entity
  stats: Entity

  initialize() {
    const player = mustFindByName(this.app.root, 'Player')
    this.name = mustFindByName(this.entity, 'Name')
    this.stats = mustFindByName(this.entity, 'Stats')

    const behavior = mustGetScript<WarriorBehavior>(player, 'warriorBehavior')
    if (behavior.warrior) {
      this.warrior = behavior.warrior
      this.name.element!.text = behavior.warrior.name
    }
    player.on('newWarrior', (warrior) => {
      this.warrior = warrior
      this.name.element!.text = warrior.name
    })
  }

  update() {
    if (!this.warrior) {
      return
    }
    this.stats.element!.text = `
A: ${this.warrior.currentAttack()}   D: ${this.warrior.currentDefense()}
HP: ${this.warrior.currentHealth} / ${this.warrior.initialHealth}

dGump: ${this.warrior.wootgumpBalance} / ${this.warrior.initialGump}
`.trim()
  }
}
