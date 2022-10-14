import { BoundingBox, Entity, Vec3 } from "playcanvas";
import { deterministicRandom } from "../boardLogic/random";
import { ScriptTypeBase } from "../types/ScriptTypeBase";

import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";
import { randomBounded } from "../utils/randoms";

interface TileSetup {
  tile: [number,number]
  seed: string
}

export function cellNameFromCoordinates(x:number, y:number) {
  return `Tile-${x}-${y}`
}

@createScript("tileLogic")
class TileLogic extends ScriptTypeBase {

  wootgumpTemplate:Entity
  wootgumpLight:Entity
  name: string
  boundingBox:BoundingBox

  initialize() {
    this.wootgumpTemplate = mustFindByName(this.entity, 'Wootgump')
    this.wootgumpLight = mustFindByName(this.entity, 'WootgumpLight')

    this.boundingBox = mustFindByName(this.entity, 'BaseTile').render!.meshInstances[0].aabb
  }

  initialSetup(setup: TileSetup) {
    this.wootgumpLight.enabled = false
    this.wootgumpTemplate.enabled = false
    this.entity.name = cellNameFromCoordinates(setup.tile[0], setup.tile[1])
    this.name = this.entity.name
    const debugLabel = mustFindByName(this.entity, 'Label').element
    if (debugLabel) {
      debugLabel.text = `${setup.tile[0]}-${setup.tile[1]}`
    }
    this.setupTree(setup.seed)
  }

  private setupTree(seed:string) {
    // keep 40% of the trees
    const tree = mustFindByName(this.entity, 'Tree')
    if (deterministicRandom(10, `${this.name}-treekeeper`, seed) > 4) {
      tree.destroy()
      return
    }
    console.log("tree position: ", tree.getLocalPosition())
    console.log(this.boundingBox.halfExtents)
    // console.log('setting up tree', randomBounded(this.boundingBox.halfExtents.x), 0, randomBounded(this.boundingBox.halfExtents.z))
    const random = this.randomPosition()
    tree.setLocalPosition(random.x, 0, random.z);
    console.log("tree position: ", tree.getLocalPosition())

    // const clone = tree.clone()
    // this.entity.addChild(clone)
    // clone.setLocalPosition(-15,0,0)
  }

  randomPosition(): Vec3 {
    const tileBoundingBox = this.boundingBox
    let xSize = tileBoundingBox.halfExtents.x * 0.9;
    let zSize = tileBoundingBox.halfExtents.z * 0.9;

    return new Vec3(
      tileBoundingBox.center.x + randomBounded(xSize * 0.5),
      0,
      tileBoundingBox.center.z + randomBounded(zSize * 0.5)
    )
  }

}

export default TileLogic
