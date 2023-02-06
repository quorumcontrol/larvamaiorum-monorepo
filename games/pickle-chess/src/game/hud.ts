import { Entity } from "playcanvas";
import { PickleChessState, RoomState } from "../syncing/schema/PickleChessState";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";


@createScript("hud")
class HUD extends ScriptTypeBase {
  private waitingEntity: Entity
  private gameOverEntity: Entity
  private state?: PickleChessState

  initialize() {
    this.waitingEntity = mustFindByName(this.entity, "WaitingForPlayers")
    this.gameOverEntity = mustFindByName(this.entity, "GameOver")
    this.app.on("newRoom", (room) => {
      this.state = room.state
    })
  }

  update() {
    if (!this.state) {
      return
    }
    this.waitingEntity.enabled = (this.state.roomState == RoomState.waitingForPlayers)
    this.gameOverEntity.enabled = (this.state.roomState == RoomState.gameOver)
  }
}

export default HUD
