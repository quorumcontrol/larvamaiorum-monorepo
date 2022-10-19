import { Entity, math } from "playcanvas";
import { ScriptTypeBase } from "../types/ScriptTypeBase";

import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";
import { NO_MORE_MOVES_EVT, TickEvent, TICK_EVT } from "./GameController";

const SECONDS_BETWEEN_ROUNDS = 12

@createScript("roundInfo")
class RoundInfo extends ScriptTypeBase {

  roundText:Entity
  moveTimer: Entity

  canChooseMove = false

  timeSinceTick:number = 0

  initialize() {
    this.roundText = mustFindByName(this.entity, 'RoundText')
    this.moveTimer = mustFindByName(this.entity, 'MoveTimer')
    this.app.on(TICK_EVT, this.handleTick, this)
    this.app.on(NO_MORE_MOVES_EVT, this.handleNoMoreMoves, this)
  }

  update(dt:number) {
    this.timeSinceTick += dt
    if (this.canChooseMove) {
      const timeRemaining = Math.max(1, Math.floor(SECONDS_BETWEEN_ROUNDS - this.timeSinceTick))
      this.moveTimer.element!.text = `Choose destination for ${timeRemaining}s` // TOOD (countdown)
    }
  }

  handleNoMoreMoves() {
    this.canChooseMove = false
    this.moveTimer.element!.text = 'No more moves.'
  }

  handleTick(evt: TickEvent) {
    this.canChooseMove = true
    this.timeSinceTick = 0
    this.roundText.element!.text = `Round ${evt.tick.tick} of ${evt.gameLength}`
  }

}

export default RoundInfo
