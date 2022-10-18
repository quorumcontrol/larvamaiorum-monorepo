import { Tween } from "playcanvas";
import { ScriptTypeBase } from "../types/ScriptTypeBase";

import { createScript } from "../utils/createScriptDecorator";
import pulser from "../utils/pulser";
import { PENDING_DESTINATION, TickEvent, TICK_EVT } from "./GameController";
import TileLogic from "./TileLogic";

export function cellNameFromCoordinates(x: number, y: number) {
  return `Tile-${x}-${y}`
}

@createScript("destinationMarker")
class DestinationMarker extends ScriptTypeBase {

  pendingTween?: Tween

  initialize() {
    this.app.on(TICK_EVT, this.handleTick, this)
    this.app.on(PENDING_DESTINATION, this.handlePending, this)
  }

  handlePending(tile:TileLogic) {
    this.moveTo(tile, true)
  }

  handleTick(evt: TickEvent) {
    const { currentPlayer, controller } = evt
    console.log("destination marker handling tick", currentPlayer)
    if (currentPlayer) {
      const warrior = evt.tick.ranked.find((w) => w.id === currentPlayer)
      if (!warrior) {
        return
      }

      console.log("currentplayer destinationMarker: ", warrior)

      if (warrior.destination) {
        const [x,y] = warrior.destination
        this.moveTo(controller.tiles[x][y], false)
      }
      return
    }
    console.log("no current player")
  }

  moveTo(tile:TileLogic, pending: boolean) {
    if (this.pendingTween) {
      this.pendingTween.stop()
    }
    this.entity.parent.removeChild(this.entity)
    tile.entity.addChild(this.entity)
    this.entity.setLocalPosition(35, 2, 35)
    this.entity.setLocalScale(80, 80, 80)
    if (pending) {
      this.pendingTween = pulser(this.entity, 10, 1)
    }
  }

}

export default DestinationMarker
