import { ScriptTypeBase } from "../types/ScriptTypeBase";

import { createScript } from "../utils/createScriptDecorator";

@createScript("slightPulse")
class SlightPulse extends ScriptTypeBase {

  initialize() {
    const starting = this.entity.getLocalPosition()
    const dest = {x: starting.x, y: starting.y - 1, z: starting.z}
    this.entity.tween(starting).to(dest, 1, pc.SineInOut).yoyo(true).loop(true).start()
  }
}

export default SlightPulse
