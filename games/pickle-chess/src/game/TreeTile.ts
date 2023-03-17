import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";
import { randomBounded } from "../utils/randoms";

@createScript("treeTile")
class TreeTile extends ScriptTypeBase {
  initialize() {
    const tree = mustFindByName(this.entity, "Trees")
    tree.setLocalPosition(randomBounded(0.4), randomBounded(0.4), 0)
  }
}

export default TreeTile
