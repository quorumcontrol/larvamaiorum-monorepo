import { Entity, SineInOut, Tween, Vec3 } from "playcanvas";
import { BattleTickReport } from "../boardLogic/Battle";
import { itemFromInventoryItem } from "../boardLogic/items";
import { deterministicBounded } from "../boardLogic/random";
import { WarriorState } from "../boardLogic/Warrior";
import { ScriptTypeBase } from "../types/ScriptTypeBase";

import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";
import pulser from "../utils/pulser";
import randomColor from "../utils/randomColor";
import TileLogic, { cellNameFromCoordinates } from "./TileLogic";

@createScript("playerLogic")
class PlayerLogic extends ScriptTypeBase {

  name: string

  nameEntity: Entity
  cardEntity: Entity
  animationHolder: Entity
  playerModel: Entity
  playerArrow: Entity

  currentTween?: Tween

  camera: Entity

  initialize() {
    this.nameEntity = mustFindByName(this.entity, 'PlayerName')
    this.animationHolder = mustFindByName(this.entity, 'HumanoidModel')
    this.camera = mustFindByName(this.app.root, "Camera")
    this.playerModel = mustFindByName(this.entity, "Viking")
    this.playerArrow = mustFindByName(this.entity, 'PlayerArrow')
    this.cardEntity = mustFindByName(this.nameEntity, "Card")
  }

  update() {
    this.nameEntity.lookAt(this.camera.getPosition())
    this.nameEntity.rotateLocal(0, 180, 0)
    // if (this.app.keyboard.wasPressed(pc.KEY_1)) {
    //   this.entity.translateLocal(0, 0, -1)
    // }
  }

  initialSetup(setup: WarriorState, currentPlayer?:string) {
    if (!setup.location) {
      throw new Error("need a location to setup a warrior")
    }
    const nameScript: any = this.getScript(this.nameEntity, 'textMesh')
    nameScript.text = setup.name
    this.name = setup.id
    const position = this.localPositionFromCell(setup.location[0], setup.location[1])
    console.log("setup warrior ", position)
    this.entity.setLocalScale(0.04, 0.04, 0.04)
    this.entity.setPosition(position.x, 0, position.z)
    const newMaterial = this.animationHolder.render!.meshInstances[0].material.clone();
    const color: [number, number, number] = randomColor({ format: 'rgbArray', seed: `${setup.name}`, luminosity: 'light' }).map((c: number) => c / 255);
    (newMaterial as any).diffuse.set(color[0], color[1], color[2])
    newMaterial.update()
    this.animationHolder.render!.meshInstances[0].material = newMaterial
    if (setup.id === currentPlayer) {
      this.playerArrow.enabled = true
      pulser(this.playerArrow, 10, 1)
    }
  }

  handleStateUpdate(warriorState:WarriorState) {
    const cardScript: any = this.getScript(this.cardEntity, 'textMesh')

    if (warriorState.currentItem) {
      const itemDescription = itemFromInventoryItem(warriorState.currentItem)
      cardScript.text = `(${itemDescription.name})`
    } else {
      cardScript.text = ""
    }
  }

  handleBattle(battleTick: BattleTickReport, tile: TileLogic, warriorElements: Record<string, PlayerLogic>) {
    if (battleTick.isOver) {
      this.setBattlingAnimation(false)
      if (this.currentTween) {
        this.currentTween.on('complete', () => {
          this.moveToPosition(tile.randomPosition(), 0.25)
          this.entity.setEulerAngles(0, 0, 0)
        })
      } else {
        this.moveToPosition(tile.randomPosition(), 0.25)
        this.entity.setEulerAngles(0, 0, 0)
      }
      if (battleTick.loser && this.entity.name === `warrior-${battleTick.loser.id}`) {
        this.animationHolder.anim!.setBoolean('isDead', true)
        this.playerModel.rotateLocal(0,90,90)
        this.playerModel.setLocalPosition(0,2.5,0)
      }
      return
    }

    if (battleTick.tick - battleTick.startingTick === 0) {
      const randomBattleLocation = tile.battlePosition(battleTick)
      let offset = deterministicBounded(1, `${battleTick.id}-${this.name}-offset`, `${battleTick.id}-offset`)
      const place = new Vec3(randomBattleLocation.x + offset, 0, randomBattleLocation.z + offset)
      this.moveToPosition(place, 1.5).on('complete', () => {
        this.setBattlingAnimation(true)
        const myPosition = this.entity.getPosition()
        const other = Object.values(warriorElements).find((we) => we !== this)!
        const otherPosition = other.entity.getPosition()
        console.log(this.entity.name, 'looking at ', other.entity.name, 'at', otherPosition, ':: this is at:', this.entity.getPosition())
        this.entity.lookAt(otherPosition.x, otherPosition.y, otherPosition.z)
        this.entity.rotateLocal(0, 180, 0)
        const length = new Vec3().sub2(myPosition, otherPosition).length()
        console.log("distance between ", this.entity.name, other.entity.name, ' is ', length)
        if (length < 0.5) {
          console.log(this.entity.name, "translating -0.5")
          this.entity.translateLocal(0, 0, -0.7)
        }
      })
    }
  }

  moveTo(tile: TileLogic) {
    const random = tile.randomPosition()
    this.animationHolder.anim!.setBoolean('isDead', false)
    this.playerModel.setEulerAngles(0,0,0)
    this.playerModel.setLocalPosition(0,-1,0)
    return this.moveToPosition(random, 1.5)
  }

  private moveToPosition(random: Vec3, time: number) {
    if (this.currentTween) {
      this.currentTween.stop()
    }
    const position = this.entity.getPosition()
    this.currentTween = this.entity.tween(position).to({ x: random.x, y: 0, z: random.z }, time, SineInOut)
    this.currentTween.on('update', () => {
      this.entity.setPosition(position)
    })
    this.currentTween.start()
    return this.currentTween
  }

  private localPositionFromCell(x: number, y: number): Vec3 {
    const cellEntity = mustFindByName(this.entity.parent as Entity, cellNameFromCoordinates(x, y))
    const cellScript = this.getScript<TileLogic>(cellEntity, 'tileLogic')
    return cellScript!.randomPosition()
  }

  private setBattlingAnimation(isBattling: boolean) {
    try {
      this.animationHolder.anim?.setBoolean('isBattling', isBattling)
    } catch (err) {
      // sometimes during replay this item is destroyed before there is a chance foor the isBattling
      // to be set by the battleUI. This just ignores that error
      console.log('error setBattling: ', err)
    }
  }

}

export default PlayerLogic
