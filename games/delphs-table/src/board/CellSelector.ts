import { MESSAGE_EVENT } from "../appWide/AppConnector";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { getGameConfig } from "../utils/config";

import { createScript } from "../utils/createScriptDecorator";
import { GAME_OVER_EVT, NO_MORE_MOVES_EVT, TICK_EVT } from "../utils/rounds";
import CellState from "./CellState";

const TRACE_AT = 0.8 // number of seconds to start tracing

@createScript("cellSelector")
class CellSelector extends ScriptTypeBase {

  timer = 0
  startedEvent?: { x: number, y: number }

  canSelect = false

  initialize() {
    if (!this.entity.camera) {
      console.error("This script must be applied to an entity with a camera component.");
      return;
    }

    const controller = getGameConfig(this.app.root).controller
    controller.on(TICK_EVT, this.handleTick, this)
    controller.on(NO_MORE_MOVES_EVT, this.handleNoMoreMoves, this)
    controller.on(GAME_OVER_EVT, this.handleGameOver, this)

    // Add a mousedown event handler
    this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.mouseDown, this);
    this.app.mouse.on(pc.EVENT_MOUSEUP, this.clearEvent, this);
    this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.clearEvent, this);

    // Add touch event only if touch is available
    if (this.app.touch) {
      this.app.touch.on(pc.EVENT_TOUCHSTART, this.touchStart, this);
      this.app.touch.on(pc.EVENT_TOUCHMOVE, this.clearEvent, this);
    }

    this.app.on(MESSAGE_EVENT, this.handleExternalEvent, this)
  }

  private handleTick() {
    this.canSelect = true
  }

  private handleNoMoreMoves() {
    this.canSelect = false
  }

  private handleGameOver() {
    this.canSelect = false
  }

  handleExternalEvent(msg: any) {
    const config = getGameConfig(this.app.root)
    if (config.grid?.isOver()) {
      return
    }
    try {
      switch (msg.type) {
        case "destinationStarting":
          config.currentPlayer?.setPendingDestination(msg.x, msg.y)
          break;
        case "destinationComplete":
          console.log("destination complete, success?", msg.success)
          if (!msg.success) {
            config.currentPlayer?.clearPendingDestination()
          }
          break;
        default:
          console.log('unknown message type: ', msg)
      }
    } catch {
      console.error('error with msg:', msg)
    }
  }

  update(dt: number) {
    if (this.startedEvent) {
      this.timer += dt
      if (this.timer > TRACE_AT) {
        this.doRaycast(this.startedEvent.x, this.startedEvent.y)
        this.startedEvent = undefined
        this.timer = 0
      }
    }
  }

  clearEvent(e: pc.MouseEvent) {
    this.startedEvent = undefined
    e.event.preventDefault()
  }

  mouseDown(e: pc.MouseEvent) {
    this.startedEvent = { x: e.x, y: e.y }
  }

  touchStart(e: pc.TouchEvent) {
    // Only perform the raycast if there is one finger on the screen
    if (e.touches.length === 1) {
      this.startedEvent = { x: e.touches[0].x, y: e.touches[0].y }
    }
    e.event.preventDefault();
  }

  doRaycast(screenX: number, screenY: number) {
    if (!this.canSelect) {
      return
    }

    const config = getGameConfig(this.app.root)
    if (config.grid?.isOver()) {
      return
    }
    // The pc.Vec3 to raycast from (the position of the camera)
    const from = this.entity.getPosition();

    // The pc.Vec3 to raycast to (the click position projected onto the camera's far clip plane)
    const to = this.entity.camera!.screenToWorld(
      screenX,
      screenY,
      this.entity.camera!.farClip
    );

    // Raycast between the two points and return the closest hit result
    const result = this.app.systems.rigidbody!.raycastFirst(from, to);
    console.log('raycast', from, to, this.entity.camera!.farClip, result)

    // If there was a hit, store the entity
    if (result) {
      const hitEntity = result.entity;
      console.log("You selected " + hitEntity.name);
      const currentPlayer = getGameConfig(this.app.root).currentPlayer
      console.log('current player: ', currentPlayer)
      if (!currentPlayer) {
        console.log('no current player')
        return
      }
      const cellState = this.getScript<CellState>(hitEntity, 'cellState')
      if (!cellState) {
        console.error('no cell state')
        return
      }
      if (!cellState.cell) {
        throw new Error('no cell')
      }
      console.log('posting message from game')
      parent.postMessage(JSON.stringify({
        type: 'destinationSetter',
        data: [cellState.cell.x, cellState.cell.y],
      }), '*')
      currentPlayer.setPendingDestination(cellState.cell.x, cellState.cell.y)
    }
  }
}

export default CellSelector;
