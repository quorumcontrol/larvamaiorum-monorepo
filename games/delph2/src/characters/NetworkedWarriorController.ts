import { AnimComponent, Entity, Vec3 } from "playcanvas";
import { createScript } from "../utils/createScriptDecorator";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import WarriorLocomotion from "./WarriorLocomotion";
import mustFindByName from "../utils/mustFindByName";
// import WarriorBehavior from "./WarriorBehavior";
import { State, Warrior } from "../syncing/schema/DelphsTableState";
import mustGetScript from "../utils/mustGetScript";

@createScript("networkedWarriorController")
class NetworkedWarriorController extends ScriptTypeBase {
  locomotion: WarriorLocomotion
  state: State
  anim: AnimComponent
  healthBar: Entity
  warrior: Warrior
  cardText: Entity

  screen: Entity
  camera: Entity

  initialize() {
    const locomotion = this.getScript<WarriorLocomotion>(this.entity, 'warriorLocomotion')
    if (!locomotion) {
      throw new Error('player controller requries locomotion')
    }
    this.locomotion = locomotion
    this.anim = mustFindByName(this.entity, 'viking').anim!
    this.healthBar = mustFindByName(this.entity, 'HealthBar')
    this.camera = mustFindByName(this.app.root, 'Camera')
    this.screen = mustFindByName(this.entity, 'PlayerNameScreen')
    this.cardText = mustFindByName(this.entity, 'CardInPlay')
    this.entity.once('newWarrior', () => {
      const effect = mustFindByName(this.app.root, 'PlayerAppearEffect').clone()
      effect.name = `player-appear-${this.entity.getGuid()}`
      this.app.root.addChild(effect)
      effect.setPosition(this.entity.getPosition())
      effect.enabled = true
      mustGetScript<any>(effect, 'effekseerEmitter').play()
    })

  }

  update() {
    if (!this.warrior) {
      return
    }
    this.screen.lookAt(this.camera.getPosition())
    this.screen.rotateLocal(0, 180, 0)
    this.healthBar.element!.width = this.warrior!.currentHealth / this.warrior!.initialHealth * 150
  }

  setState(newState:State) {
    if (this.state === newState) {
      return
    }
    console.log('set state: ', newState, this.entity.name)
    this.state = newState
    if (newState !== State.deerAttack) {
      this.anim.setBoolean('deerAttack', false)
    }
    if (newState !== State.battle) {
      this.anim.setBoolean('battling', false)
    }
    switch (newState) {
      case State.move:
        this.anim.setFloat('health', 100)
        return
      case State.taunt:
        //TODO this should be an animation, but for now idle it
        this.anim.setFloat('health', 100)
        return
      case State.dead:
        this.anim.setFloat('health', 0)
        return
      case State.deerAttack:
        this.anim.setBoolean('deerAttack', true)
        return
      case State.battle:
        this.anim.setBoolean('battling', true)
        return
    }
  }

  setPlayer(player:Warrior) {
    this.warrior = player
    console.log('player set', player.toJSON())
    this.entity.setPosition(player.position.x, 0, player.position.z)

    const torso = mustFindByName(this.entity, 'Torso')

    const newMaterial = torso.render!.meshInstances[0].material.clone()
    const color = player.color.toArray()
    ;(newMaterial as any).diffuse.set(color[0], color[1], color[2])
    newMaterial.update()
    torso.render!.meshInstances[0].material = newMaterial

    player.onChange = (changes) => {
      // console.log("changes: ", changes)
      this.locomotion.setSpeed(player.speed)
      this.setState(player.state)
      if (!!player.currentItem) {
        this.cardText.enabled = true
        this.cardText.element!.text = `(${player.currentItem.name})`
      } else {
        this.cardText.enabled = false
      }
    }
    player.destination.onChange = () => {
      // console.log("new destination: ", player.destination.toJSON())
      this.locomotion.setDestination(new Vec3(player.destination.x, 0, player.destination.z))
      // this.locomotion.setDestination(player.destination.x, player.destination.z)
    }
    player.position.onChange = () => {
      // console.log(' new position: ', player.position.toJSON())
      this.locomotion.setServerPosition(new Vec3(player.position.x, 0, player.position.z))
    }
    this.entity.fire('newWarrior', player)
  }
}

export default NetworkedWarriorController;
