import { Entity } from "playcanvas";
import { itemFromInventoryItem } from "../boardLogic/items";
import { WarriorState } from "../boardLogic/Warrior";
import { ScriptTypeBase } from "../types/ScriptTypeBase";

import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";
import { TickEvent, TICK_EVT, WARRIOR_SETUP_EVT } from "./GameController";

export function cellNameFromCoordinates(x:number, y:number) {
  return `Tile-${x}-${y}`
}

@createScript("leaderboard")
class Leaderboard extends ScriptTypeBase {

  warriors:Entity

  initialize() {
    this.app.on(TICK_EVT, this.handleTick, this)
    this.app.once(WARRIOR_SETUP_EVT, this.updateLeaderboard, this)
    this.warriors = mustFindByName(this.entity, 'Warriors')
  }

  updateLeaderboard(warriors:WarriorState[]) {
    const txt = warriors.map((w) => {
      const diff = w.wootgumpBalance - w.initialGump
      const item = w.currentItem ? itemFromInventoryItem(w.currentItem) : undefined
      const cardText = item ? `${item.name} in play.` : ""
      return `${w.name}: $dGUMP ${w.wootgumpBalance} (${diff > 0 ? '+' : ''}${diff})
ATK: ${w.attack} HP: ${Math.floor(w.currentHealth)}/${w.initialHealth} DEF: ${w.defense}
${cardText}`
    }).join("\n\n")
    this.warriors.element!.text = txt
  }

  handleTick(evt: TickEvent) {
    this.updateLeaderboard(evt.tick.ranked)
  }

}

export default Leaderboard
