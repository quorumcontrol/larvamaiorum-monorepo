import { Entity } from 'playcanvas'
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";
import { Warrior } from "../syncing/schema/DelphsTableState";

@createScript("hud")
class Hud extends ScriptTypeBase {
  warrior?:Warrior

  name: Entity
  stats: Entity

  initialize() {
    this.name = mustFindByName(this.entity, 'Name')
    this.stats = mustFindByName(this.entity, 'Stats')
  }

  setWarrior(warrior:Warrior) {
    this.warrior = warrior
    this.name.element!.text = warrior.name
  }

  update() {
    if (!this.warrior) {
      return
    }
    this.stats.element!.text = `
A: ${this.warrior.attack}   D: ${this.warrior.defense}
HP: ${this.warrior.currentHealth} / ${this.warrior.initialHealth}

dGump: ${this.warrior.wootgumpBalance} (${this.warrior.wootgumpBalance - this.warrior.initialGump})
`.trim()
  }
}

export default Hud
