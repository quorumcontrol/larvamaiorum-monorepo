import { Entity } from "playcanvas";
import { ScriptTypeBase } from "../types/ScriptTypeBase";

import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";
import { TickEvent, TICK_EVT } from "./GameController";

export function cellNameFromCoordinates(x:number, y:number) {
  return `Tile-${x}-${y}`
}

@createScript("roundInfo")
class RoundInfo extends ScriptTypeBase {

  roundText:Entity
  moveTimer: Entity

  initialize() {
    this.app.on(TICK_EVT, this.handleTick, this)
    this.roundText = mustFindByName(this.entity, 'RoundText')
    this.moveTimer = mustFindByName(this.entity, 'MoveTimer')
  }

  handleTick(evt: TickEvent) {
    this.roundText.element!.text = `Round ${evt.tick.tick}/${evt.gameLength}`
    this.moveTimer.element!.text = '' // TOOD
  }

}

export default RoundInfo
