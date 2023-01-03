import { BoundingBox, Vec3 } from "playcanvas";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { createScript } from "../utils/createScriptDecorator";
import { randomBounded } from "../utils/randoms";

@createScript("playingField")
class PlayingField extends ScriptTypeBase {
  boundingBox: BoundingBox
  
  initialize() {
    var aabb = new pc.BoundingBox();
    this.entity.render!.meshInstances.forEach((mi, i) => {
        if (i === 0)
            aabb.copy(mi.aabb);
        else
            aabb.add(mi.aabb);
    });

    this.boundingBox = aabb
    console.log("tile half extents: ", this.boundingBox.halfExtents.x, this.boundingBox.halfExtents.z)
  }

  randomPosition(): Vec3 {
    const tileBoundingBox = this.boundingBox
    let xSize = tileBoundingBox.halfExtents.x;
    let zSize = tileBoundingBox.halfExtents.z;
    return new Vec3(
      this.entity.getPosition().x + randomBounded(xSize / 2),
      0,
      this.entity.getPosition().z + randomBounded(zSize / 2)
    )
  }

}

export default PlayingField;
