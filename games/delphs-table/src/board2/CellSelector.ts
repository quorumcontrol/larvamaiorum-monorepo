import { ScriptTypeBase } from "../types/ScriptTypeBase";

import { createScript } from "../utils/createScriptDecorator";

export const SELECT_EVT = 'PLAYER_SELECT'
export const HOVER_EVT = 'START_HOVER_EVENT'
export const STOP_HOVER_EVT = 'STOP_HOVER_EVENT'

@createScript("cellSelector")
class CellSelector extends ScriptTypeBase {

  startEvent?: {
    time: number
    x: number
    y: number
  }

  lastTouch?: {
    x: number
    y: number
  }

  hoverTime?: {
    isHovering: boolean
    time: number
    x: number
    y: number
  }

  initialize() {
    if (!this.entity.camera) {
      console.error("This script must be applied to an entity with a camera component.");
      return;
    }

    // Add a mousedown event handler
    this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.mouseDown, this);
    this.app.mouse.on(pc.EVENT_MOUSEUP, this.mouseUp, this);
    this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.handleMouseMove, this);

    // Add touch event only if touch is available
    if (this.app.touch) {
      this.app.touch.on(pc.EVENT_TOUCHSTART, this.touchStart, this);
      this.app.touch.on(pc.EVENT_TOUCHEND, this.touchEnd, this);
      this.app.touch.on(pc.EVENT_TOUCHMOVE, this.setLastTouch, this);
    }
  }

  update(dt: number) {
    if (this.hoverTime) {
      this.hoverTime.time += dt
      if (this.hoverTime.time >= 0.2 || this.hoverTime.isHovering) {
        this.doHoverCast()
      }
    }
  }

  handleMouseMove(evt: MouseEvent) {
    this.hoverTime = {
      time: 0,
      x: evt.x,
      y: evt.y,
      isHovering: !!this.hoverTime?.isHovering,
    }
  }

  mouseUp(e: pc.MouseEvent) {
    this.calculateShouldRay(e.x, e.y)
  }

  mouseDown(e: pc.MouseEvent) {
    this.startEvent = { x: e.x, y: e.y, time: Date.now() }
  }

  setLastTouch(e: pc.TouchEvent) {
    if (e.touches.length === 1) {
      this.lastTouch = {
        x: e.touches[0].x,
        y: e.touches[0].y,
      }
    }
  }

  touchStart(e: pc.TouchEvent) {
    // Only perform the raycast if there is one finger on the screen
    if (e.touches.length === 1) {
      console.log('touch start')
      this.lastTouch = {
        x: e.touches[0].x,
        y: e.touches[0].y,
      }
      this.startEvent = { x: e.touches[0].x, y: e.touches[0].y, time: Date.now() }
    }
  }

  touchEnd(e: pc.TouchEvent) {
    console.log('touch end', e, this.lastTouch)
    if (!this.lastTouch) {
      throw new Error('should not be no last touch')
    }
    this.calculateShouldRay(this.lastTouch.x, this.lastTouch.y)
  }

  private calculateShouldRay(x: number, y: number) {
    if (!this.startEvent) {
      return
    }
    if (Date.now() - this.startEvent.time > 500) {
      console.log('too long a click')
      this.clearStartEvent()
      return
    }
    const distance = this.getDistance(x, y)
    if (distance > 12) {
      console.log('too much movement for a click')
      this.clearStartEvent()
      return
    }
    this.doRaycast(this.startEvent.x, this.startEvent.y)
    this.clearStartEvent()
  }

  private clearStartEvent() {
    this.startEvent = undefined
  }

  private getDistance(x: number, y: number) {
    // Return the distance between the two points
    var dx = this.startEvent!.x - x;
    var dy = this.startEvent!.y - y;

    return Math.sqrt((dx * dx) + (dy * dy));
  };

  doRaycast(screenX: number, screenY: number) {
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

    // If there was a hit, emit the entity
    if (result) {
      const hitEntity = result.entity;
      console.log(SELECT_EVT, hitEntity)
      this.app.fire(SELECT_EVT, hitEntity)
    }
  }

  doHoverCast() {
    if (!this.hoverTime) {
      console.error('no hover time even though doing the hover cast')
      return
    }
    // The pc.Vec3 to raycast from (the position of the camera)
    const from = this.entity.getPosition();

    // The pc.Vec3 to raycast to (the click position projected onto the camera's far clip plane)
    const to = this.entity.camera!.screenToWorld(
      this.hoverTime.x,
      this.hoverTime.y,
      this.entity.camera!.farClip
    );

    // Raycast between the two points and return the closest hit result
    const result = this.app.systems.rigidbody!.raycastFirst(from, to);

    // If there was a hit, emit the entity
    if (result && result.entity.name == "PlayerPhysics") {
      if (!this.hoverTime.isHovering) {
        this.hoverTime.isHovering = true
        const hitEntity = result.entity;
        hitEntity.parent.fire(HOVER_EVT)
      }
      return
    }

    // otherwise we stopped hovering
    this.app.fire(STOP_HOVER_EVT)
    this.hoverTime.isHovering = false

  }
}

export default CellSelector;
