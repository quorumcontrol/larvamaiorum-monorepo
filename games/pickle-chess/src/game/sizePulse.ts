import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { createScript } from "../utils/createScriptDecorator";

@createScript("sizePulse")
class SizePulse extends ScriptTypeBase {

  initialize() {
    this.slowlyPulse()
  }

  slowlyPulse() {
    this.entity
    .tween(this.entity.getLocalScale())
    .to(new pc.Vec3(0.09, 0.09, 0.09), 1.5, pc.SineInOut)
    .loop(true)
    .yoyo(true)
    .start();
  }
}

export default SizePulse
