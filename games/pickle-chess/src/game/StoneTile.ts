import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";
import { randomBounded } from "../utils/randoms";


@createScript("stoneTile")
class StoneTile extends ScriptTypeBase {
  initialize() {
    const stone = mustFindByName(this.entity, "StoneMountain")
    stone.setLocalEulerAngles(0, randomBounded(180), 0)
  }
}

export default StoneTile
