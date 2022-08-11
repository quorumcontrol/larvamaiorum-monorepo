import { Entity } from "playcanvas";
import { ScriptTypeBase } from "../types/ScriptTypeBase";

import { createScript } from "../utils/createScriptDecorator";

export const UI_FOCUS_REQUEST = 'ui:focusRequest'

@createScript("focuser")
class Focuser extends ScriptTypeBase {
  cameraScript:any

  initialize() {
    const cameraScript = this.getScript<any>(this.entity, "orbitCamera");
    if (!cameraScript) {
      throw new Error('no camera script')
    }
    this.cameraScript = cameraScript

    this.app.on(UI_FOCUS_REQUEST, (entity:Entity) => {
      cameraScript.focus(entity)
    })
  }
}

export default Focuser
