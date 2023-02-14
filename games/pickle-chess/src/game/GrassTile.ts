import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { createScript } from "../utils/createScriptDecorator";
import { randomInt } from "../utils/randoms";


@createScript("grassTile")
class GrassTile extends ScriptTypeBase {
  initialize() {
    this.entity.setLocalEulerAngles(0, randomInt(4) * 90, 0)
  }
}

export default GrassTile
