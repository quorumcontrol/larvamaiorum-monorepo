import { Entity, SineInOut, Tween, Vec3 } from "playcanvas";
import Battle from "../boardLogic/Battle";
import Cell from "../boardLogic/Cell";
import Warrior from "../boardLogic/Warrior";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { getGameConfig } from "../utils/config";

import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";
import randomColor from "../utils/randomColor";
import { randomBounded } from "../utils/randoms";
import BattleUI from "./BattleUI";

@createScript("playerMarker")
class PlayerMarker extends ScriptTypeBase {

  // gridParent: Entity
  warrior?: Warrior
  name: Entity
  healthText: Entity
  gumpText: Entity
  threeDNameEntity: Entity
  humanoid: Entity
  threeDNameScript: any // textMesh script
  stats: Entity
  previousPoint?: Vec3
  currentTween?: Tween
  rotatedForBattle = false



  initialize() {
    // this.gridParent = this.entity.parent as Entity
    this.name = mustFindByName(this.entity, "Name")
    this.healthText = mustFindByName(this.entity, "HealthText")
    this.gumpText = mustFindByName(this.entity, "GumpText")
    this.threeDNameEntity = mustFindByName(this.entity, "3DName")
    this.threeDNameScript = this.getScript(this.threeDNameEntity, "textMesh")!
    this.stats = mustFindByName(this.entity, "Stats")
    this.humanoid = mustFindByName(this.entity, 'HumanoidModel')
  }

  update() {
    if (this.warrior) {
      this.threeDNameScript.text = `${this.warrior.name} (WG: ${this.warrior.wootgumpBalance})`
      // this.healthText.element!.text = `${Math.ceil(this.warrior.currentHealth)}`
      // this.gumpText.element!.text = `Gump: ${this.warrior.wootgumpBalance}`
      this.stats.element!.text = `HP:${Math.ceil(this.warrior.currentHealth)}/${this.warrior.initialHealth} A:${this.warrior.attack}  D:${this.warrior.defense}`
    }
  }

  private setBattlingAnimation(isBattling: boolean) {
    try {
      console.log('set battling: ', isBattling)
      this.humanoid.anim?.setBoolean('isBattling', isBattling)
    } catch (err) {
      // sometimes during replay this item is destroyed before there is a chance foor the isBattling
      // to be set by the battleUI. This just ignores that error
      console.log('error setBattling: ', err)
    }
  }

  private localPositionFromCell(cell: Cell): Vec3 {
    const cellEntity = mustFindByName(this.entity.parent as Entity, cell.id)

    const tileBoundingBox = cellEntity.render!.meshInstances[0].aabb;
    let xSize = tileBoundingBox.halfExtents.x * 0.9;
    let zSize = tileBoundingBox.halfExtents.z * 0.9;

    return new Vec3(
      tileBoundingBox.center.x + randomBounded(xSize * 0.5),
      0.86,
      tileBoundingBox.center.z + randomBounded(zSize * 0.5)
    )
  }

  private setInitialLocation() {
    try {
      if (!this.warrior) {
        throw new Error('can only set location after warrior')
      }
      const cell = this.warrior.location
      if (!cell) {
        throw new Error('no initial location')
      }
      const position = this.localPositionFromCell(cell)
      // this.entity.setLocalPosition(...position);
      this.entity.setLocalPosition(position.x, position.y, position.z);
      this.previousPoint = position
    } catch (err) {
      console.error('error set initial location')
      console.log('parent: ', this.entity.parent.name, this.entity.parent)
      throw err
    }
  }

  handleBattling(_battle: Battle) {
    console.log('battling')
    this.setBattlingAnimation(true)
  }

  handleBattleOver(_battle: Battle) {
    console.log('battleOver')
    this.setBattlingAnimation(false)
    if (this.rotatedForBattle) {
      this.unrotateAfterBattle()
    }
  }

  handleNewLocation(cell: Cell) {
    const newLocation = this.localPositionFromCell(cell)

    if (this.currentTween) {
      this.currentTween.stop()
    }
    this.currentTween = this.entity.tween(this.entity.getLocalPosition()).to({ x: newLocation.x, y: newLocation.y, z: newLocation.z }, 1.5, SineInOut).start()
    this.previousPoint = newLocation
  }

  rotateForBattle() {
    this.entity.setLocalEulerAngles(0, 180, 0)
    this.threeDNameEntity.setLocalEulerAngles(-15,0,0)
    this.stats.setLocalEulerAngles(-15,0,0)
    this.threeDNameEntity.translateLocal(0,7,0)
    this.stats.translateLocal(0,7,0)
    this.rotatedForBattle = true
  }

  unrotateAfterBattle() {
    console.log(`${this.warrior?.id} unrotate after battle`)
    this.rotatedForBattle = false
    this.threeDNameEntity.translateLocal(0,-7,0)
    this.stats.translateLocal(0,-7,0)
    this.threeDNameEntity.setLocalEulerAngles(-15,180,0)
    this.stats.setLocalEulerAngles(-15,180,0)
    this.entity.setLocalEulerAngles(0,0,0)
  }

  handleBattleUI(battleUI: BattleUI) {
    console.log('battle ui: ', battleUI)
    if (this.currentTween) {
      this.currentTween.stop()
    }
    const gridPositions = battleUI.gridPositions()
    const index = battleUI.battle!.warriors.indexOf(this.warrior!)
    console.log("position: ", gridPositions[index])
    this.entity.setPosition(gridPositions[index].x, gridPositions[index].y, gridPositions[index].z);
    this.entity.translateLocal(0, 0.25, 0)
    if (index === 1) {
      this.rotateForBattle()
    }
  }

  setWarrior(warrior: Warrior) {
    this.warrior = warrior
    // this.name.element!.text = warrior.name
    this.threeDNameScript.text = `${warrior.name}`
    const config = getGameConfig(this.app.root)
    if (config.currentPlayer === warrior) {
      mustFindByName(this.entity, 'PlayerArrow').enabled = true
    }
    this.setInitialLocation()
    this.warrior.on('location', (cell) => this.handleNewLocation(cell))
    this.warrior.on('battle', (battle) => this.handleBattling(battle))
    this.warrior.on('battleOver', (battle) => this.handleBattleOver(battle))
    this.warrior.on('battleUI', (ui) => { this.handleBattleUI(ui) })
    const newMaterial = this.humanoid.render!.meshInstances[0].material.clone();
    const color:[number,number,number] = randomColor({ format: 'rgbArray', seed: `${warrior.id}${config.grid?.id}` }).map((c:number) => c/255);
    (newMaterial as any).diffuse.set(color[0], color[1], color[2])
    newMaterial.update()
    this.humanoid.render!.meshInstances[0].material = newMaterial
  }
}

export default PlayerMarker
