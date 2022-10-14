import { BoundingBox, Entity, Vec3 } from "playcanvas";
import { deterministicRandom } from "../boardLogic/random";
import { ScriptTypeBase } from "../types/ScriptTypeBase";

import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";
import { randomBounded } from "../utils/randoms";
import TileLogic, { cellNameFromCoordinates } from "./TileLogic";

interface Warrior {
  tile: [number,number]
  name: string
}

@createScript("playerLogic")
class PlayerLogic extends ScriptTypeBase {

  nameEntity: Entity

  initialize() {
    this.nameEntity = mustFindByName(this.entity, 'PlayerName')
  }

  initialSetup(setup: Warrior) {
    const nameScript:any = this.getScript(this.nameEntity, 'textMesh')
    nameScript.text = setup.name
    const position = this.localPositionFromCell(setup.tile[0], setup.tile[1])
    console.log("setup warrior", position)
    this.entity.setLocalScale(0.04,0.04,0.04)
    this.entity.setLocalPosition(position.x, position.y, position.z)
  }

  private localPositionFromCell(x:number, y:number): Vec3 {
    const cellEntity = mustFindByName(this.entity.parent as Entity, cellNameFromCoordinates(x,y))
    const cellScript = this.getScript<TileLogic>(cellEntity, 'tileLogic')
    const tileBoundingBox = cellScript!.boundingBox
    let xSize = tileBoundingBox.halfExtents.x * 0.9;
    let zSize = tileBoundingBox.halfExtents.z * 0.9;

    return new Vec3(
      tileBoundingBox.center.x + randomBounded(xSize * 0.5),
      -0.05,
      tileBoundingBox.center.z + randomBounded(zSize * 0.5)
    )
  }

}

export default PlayerLogic
