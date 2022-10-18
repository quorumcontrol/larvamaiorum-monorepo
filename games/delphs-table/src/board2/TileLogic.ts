import { BoundingBox, Entity, Material, SoundComponent, Vec3 } from "playcanvas";
import { BattleTickReport } from "../boardLogic/Battle";
import { CellOutComeDescriptor } from "../boardLogic/Cell";
import { deterministicRandom } from "../boardLogic/random";
import Wootgump from "../boardLogic/Wootgump";
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
  baseTile:Entity
  alternativeMaterial: Material

  gump:Record<string, Entity>

  battleSound: SoundComponent

  battleCount = 0

  x:number
  y:number

  initialize() {
    this.gump = {}

    this.wootgumpTemplate = mustFindByName(this.entity, 'Wootgump')
    this.wootgumpLight = mustFindByName(this.entity, 'WootgumpLight')
    const templates = mustFindByName(this.app.root, "Templates")
    const alternativeMaterialHolder = mustFindByName(templates, "alternativeTileMaterial0")
    console.log("alternativeMaterialHolder.render", alternativeMaterialHolder.render)
    this.alternativeMaterial = alternativeMaterialHolder.render!.meshInstances[0].material
    this.battleSound = mustFindByName(this.entity, "BattleSound").findComponent('sound') as SoundComponent
  }

  initialSetup(setup: TileSetup) {
    this.baseTile = mustFindByName(this.entity, 'BaseTile')
    var aabb = new pc.BoundingBox();
    this.baseTile.render!.meshInstances.forEach((mi, i) => {
        if (i === 0)
            aabb.copy(mi.aabb);
        else
            aabb.add(mi.aabb);
    });

    this.boundingBox = aabb

    this.wootgumpLight.enabled = false
    this.wootgumpTemplate.enabled = false
    this.x = setup.tile[0]
    this.y = setup.tile[1]
    this.entity.name = cellNameFromCoordinates(this.x, this.y)
    this.name = this.entity.name
    const debugLabel = mustFindByName(this.entity, 'Label').element
    if (debugLabel) {
      debugLabel.text = `${this.x}-${this.y}`
    }
    this.setupTree(setup.seed)
    this.setupShrub(setup.seed)
    this.setupBaseTile(setup.seed)
  }

  handleCellOutcome(outcome:CellOutComeDescriptor) {
    outcome.spawned.forEach((gump) => {
      this.spawnGump(gump)
    })
    Object.values(outcome.harvested).flat().forEach((gump) => {
      this.destroyGump(gump.id)
    })
    this.adjustWootgumpLight()
  }

  private adjustWootgumpLight() {
    const numWootgump = Object.values(this.gump).length
    if (numWootgump === 0) {
      this.wootgumpLight.enabled = false
      return
    }

    this.wootgumpLight.enabled = true
    const intensity = (Math.log(numWootgump + 1))
    console.log('setting intensity to ', intensity)
    this.wootgumpLight.light!.intensity = intensity
  }

  private spawnGump(gump:Wootgump) {
    const gumpEntity = this.wootgumpTemplate.clone() as Entity
    gumpEntity.name = gump.id
    this.gump[gump.id] = gumpEntity
    gumpEntity.enabled = true
    this.entity.addChild(gumpEntity)
    const random = this.randomPosition()
    console.log("setting gump position: ", this.entity.name, random)
    gumpEntity.setPosition(random.x, 0, random.z);
    const local = gumpEntity.getLocalPosition()
    gumpEntity.setLocalPosition(local.x, 0, local.z)
  }

  private setupBaseTile(seed:string) {
    let rotation = deterministicRandom(4, `${this.name}-tile-rotator`, seed) * 90
    if (rotation === 270) {
      rotation = 0
      this.baseTile.render!.meshInstances[1].material = this.alternativeMaterial
    }
    this.baseTile.setLocalEulerAngles(-90, rotation, 0)
  }

  private setupShrub(seed:string) {
     // keep 20% of the shrubs
     const shrubs = mustFindByName(this.entity, 'Shrubs')
     if (deterministicRandom(10, `${this.name}-shrubkeeper`, seed) < 8) {
      shrubs.destroy()
       return
     }
     // console.log('setting up tree', randomBounded(this.boundingBox.halfExtents.x), 0, randomBounded(this.boundingBox.halfExtents.z))
     const random = this.randomPosition()
     shrubs.setPosition(random.x, 0, random.z);
  }

  private setupTree(seed:string) {
    // keep 40% of the trees
    const tree = mustFindByName(this.entity, 'Tree')
    if (deterministicRandom(10, `${this.name}-treekeeper`, seed) > 4) {
      tree.destroy()
      return
    }
    const random = this.randomPosition()
    tree.setPosition(random.x, 0, random.z);
  }

  private destroyGump(id:string) {
    const gump = this.gump[id]
    const start = gump.getLocalPosition()
    gump.tween(start).to({x: start.x, y: start.y + 200, z: start.z}, 2.0).on('complete', () => {
      gump.destroy()
      delete this.gump[id]
    }).start()
  }

  handleBattle(battleTick:BattleTickReport) {
    console.log('tile handling', battleTick)
    const relativeTick = battleTick.tick - battleTick.startingTick
    if (relativeTick === 0 && battleTick.isOver) {
      return
    }

    if (relativeTick === 0) {
      this.battleCount++
      if (this.battleCount === 1) {
        Object.values(this.battleSound.slots).forEach((slot) => slot.play())
      }
    }

    if (battleTick.isOver) {
      this.battleCount--
      if (this.battleCount === 0) {
        Object.values(this.battleSound.slots).forEach((slot) => slot.stop())
      }
    }
  }

  deterministicRandomPosition(id:string, seed:string) {
    const tileBoundingBox = this.boundingBox
    let xSize = tileBoundingBox.halfExtents.x * 0.9;
    let zSize = tileBoundingBox.halfExtents.z * 0.9;
    const tile = mustFindByName(this.entity, 'BaseTile')
    return new Vec3(
      tile.getPosition().x + deterministicRandom(xSize / 2, `${id}-x`, seed),
      0,
      tile.getPosition().z + deterministicRandom(zSize / 2, `${id}-z`, seed)
    )
  }

  battlePosition(battleTick:BattleTickReport): Vec3 {
    return this.deterministicRandomPosition(`${battleTick.id}-location`, battleTick.id)
  }

  randomPosition(): Vec3 {
    const tileBoundingBox = this.boundingBox
    let xSize = tileBoundingBox.halfExtents.x * 0.9;
    let zSize = tileBoundingBox.halfExtents.z * 0.9;
    const tile = mustFindByName(this.entity, 'BaseTile')
    return new Vec3(
      tile.getPosition().x + randomBounded(xSize / 2),
      0,
      tile.getPosition().z + randomBounded(zSize / 2)
    )
  }

}

export default TileLogic
