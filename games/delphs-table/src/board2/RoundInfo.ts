import { Entity } from "playcanvas";
import { ScriptTypeBase } from "../types/ScriptTypeBase";

import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";
import { NO_MORE_MOVES_EVT, TickEvent, TICK_EVT } from "./GameController";

export function cellNameFromCoordinates(x:number, y:number) {
  return `Tile-${x}-${y}`
}

@createScript("roundInfo")
class RoundInfo extends ScriptTypeBase {

  roundText:Entity
  moveTimer: Entity

  initialize() {
    this.roundText = mustFindByName(this.entity, 'RoundText')
    this.moveTimer = mustFindByName(this.entity, 'MoveTimer')
    this.app.on(TICK_EVT, this.handleTick, this)
    this.app.on(NO_MORE_MOVES_EVT, this.handleNoMoreMoves, this)
  }

  handleNoMoreMoves() {
    this.moveTimer.element!.text = 'No more moves.'
  }

  handleTick(evt: TickEvent) {
    this.roundText.element!.text = `Round ${evt.tick.tick}/${evt.gameLength}`
    this.moveTimer.element!.text = 'Choose destination.' // TOOD (countdown)
  }

}

export default RoundInfo
