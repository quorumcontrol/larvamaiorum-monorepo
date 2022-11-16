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
import { HOVER_EVT, STOP_HOVER_EVT } from "./CellSelector";
import TileLogic, { cellNameFromCoordinates } from "./TileLogic";

@createScript("playerLogic")
class PlayerLogic extends ScriptTypeBase {

  name: string
  isDead = false

  nameEntity: Entity
  cardEntity: Entity
  playerModel: Entity
  playerArrow: Entity
  stats: Entity
  statsText: Entity
  statsName: Entity

  currentTween?: Tween

  camera: Entity

  initialize() {
    this.nameEntity = mustFindByName(this.entity, 'PlayerName')
    // this.animationHolder = mustFindByName(this.entity, 'HumanoidModel')
    this.camera = mustFindByName(this.app.root, "Camera")
    this.playerModel = mustFindByName(this.entity, "Viking")
    this.playerArrow = mustFindByName(this.entity, 'PlayerArrow')
    this.cardEntity = mustFindByName(this.nameEntity, "Card")
    this.stats = mustFindByName(this.entity, "Stats")
    this.statsText = mustFindByName(this.stats, "StatsText")
    this.statsName = mustFindByName(this.stats, "Name")
    mustFindByName(this.stats, "Background").button!.on(pc.EVENT_MOUSEDOWN, (evt:MouseEvent) => {
      console.log('evt', evt)
      evt.stopPropagation()
      this.unhover()
    }, this)
    this.entity.on(HOVER_EVT, this.hover, this)
    this.app.on(STOP_HOVER_EVT, this.unhover, this)
  }

  update() {
    this.nameEntity.lookAt(this.camera.getPosition())
    this.nameEntity.rotateLocal(0, 180, 0)

    if (this.stats.enabled) {
      this.stats.lookAt(this.camera.getPosition())
      this.stats.rotateLocal(0, 180, 0)
    }

    // if (this.app.keyboard.wasPressed(pc.KEY_B) && this.name === '0xe546b43E7fF912FEf7ED75D69c1d1319595F6080') {
    //   this.setBattlingAnimation(true)
    // }
  }

  initialSetup(setup: WarriorState, currentPlayer?:string) {
    if (!setup.location) {
      throw new Error("need a location to setup a warrior")
    }
    console.log("creating entity for", setup)
    const nameScript: any = this.getScript(this.nameEntity, 'textMesh')
    nameScript.text = setup.name
    this.name = setup.id
    this.updateStats(setup)
    const position = this.localPositionFromCell(setup.location[0], setup.location[1])
    this.entity.setLocalScale(0.04, 0.04, 0.04)
    this.entity.setPosition(position.x, 0, position.z)

    const torso = mustFindByName(this.entity, 'HumanoidModel')

    const newMaterial = torso.render!.meshInstances[0].material.clone();
    const color: [number, number, number] = randomColor({ format: 'rgbArray', seed: `${setup.name}`, luminosity: 'light' }).map((c: number) => c / 255);
    (newMaterial as any).diffuse.set(color[0], color[1], color[2])
    newMaterial.update()
    torso.render!.meshInstances[0].material = newMaterial
    if (setup.id === currentPlayer) {
      this.playerArrow.enabled = true
      pulser(this.playerArrow, 10, 1)
    }
  }

  handleStateUpdate(warriorState:WarriorState) {
    const cardScript: any = this.getScript(this.cardEntity, 'textMesh')
    this.updateStats(warriorState)
    this.unhover()

    if (warriorState.currentItem) {
      const itemDescription = itemFromInventoryItem(warriorState.currentItem)
      cardScript.text = `(${itemDescription.name})`
    } else {
      cardScript.text = ""
    }
    if (warriorState.currentHealth <= 0 && !this.isDead) {
      this.isDead = true
      this.setBattlingAnimation(false)

      this.playerModel.rotateLocal(0,90,90)
      this.playerModel.setLocalPosition(0,2.5,0)
    }

    if (warriorState.currentHealth >= 0 && this.isDead) {
      this.isDead = false
      this.setIsDeadAnimation(false)
      this.playerModel.setEulerAngles(0,0,0)
      this.playerModel.setLocalPosition(0,-1,0)
    }
  }

  toggleHover() {
    this.nameEntity.enabled = !this.nameEntity.enabled
    this.stats.enabled = !this.stats.enabled
  }

  hover() {
    this.nameEntity.enabled = false
    this.stats.enabled = true
  }

  unhover() {
    this.nameEntity.enabled = true
    this.stats.enabled = false
  }

  updateStats(state:WarriorState) {
    this.statsName.element!.text = state.name
    this.statsText.element!.text = 
    `
A: ${state.attack}
D: ${state.defense}
HP: ${state.currentHealth}/${state.initialHealth}
$G: ${state.wootgumpBalance}
    `.trim()
  }

  handleBattle(battleTick: BattleTickReport, tile: TileLogic, warriorElements: Record<string, PlayerLogic>) {
    const relativeTick = battleTick.tick - battleTick.startingTick

    if (battleTick.isOver && relativeTick === 0) {
      // do nothing
      return
    }

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
      return
    }

    // handle the very first battle tick
    if (relativeTick === 0) {
      const randomBattleLocation = tile.battlePosition(battleTick)
      let offset = deterministicBounded(1, `${battleTick.id}-${this.name}-offset`, `${battleTick.id}-offset`)
      const place = new Vec3(randomBattleLocation.x + offset, 0, randomBattleLocation.z + offset)
      this.moveToPosition(place, 1.5).on('complete', () => {
        this.setBattlingAnimation(true)
        const myPosition = this.entity.getPosition()
        const other = Object.values(warriorElements).find((we) => we !== this)!
        const otherPosition = other.entity.getPosition()
        this.entity.lookAt(otherPosition.x, otherPosition.y, otherPosition.z)
        this.entity.rotateLocal(0, 180, 0)
        const length = new Vec3().sub2(myPosition, otherPosition).length()
        if (length < 0.5) {
          console.log(this.entity.name, "translating -0.5")
          this.entity.translateLocal(0, 0, -0.7)
        }
      })
    }
  }

  moveTo(tile: TileLogic) {
    const random = tile.randomPosition()
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
      console.log(`${this.name} setting battling animation`, isBattling)
      this.playerModel.anim?.setBoolean('isBattling', isBattling)
    } catch (err) {
      // sometimes during replay this item is destroyed before there is a chance foor the isBattling
      // to be set by the battleUI. This just ignores that error
      console.log('error setBattling: ', err)
    }
  }

  private setIsDeadAnimation(isDead: boolean) {
    try {
      console.log(`${this.name} setting isDead animation`, isDead)
      this.playerModel.anim?.setBoolean('isDead', isDead)
    } catch (err) {
      // sometimes during replay this item is destroyed before there is a chance foor the isBattling
      // to be set by the battleUI. This just ignores that error
      console.log('error setDead: ', err)
    }
  }

}

export default PlayerLogic
