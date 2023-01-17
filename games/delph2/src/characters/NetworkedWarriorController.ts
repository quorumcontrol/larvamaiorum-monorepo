import { AnimComponent, Entity, SoundComponent, SoundSlot } from "playcanvas";
import { createScript } from "../utils/createScriptDecorator";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import mustFindByName from "../utils/mustFindByName";
import { BehavioralState, Warrior } from "../syncing/schema/DelphsTableState";
import mustGetScript from "../utils/mustGetScript";
import { loadGlbContainerFromUrl } from "../utils/glbUtils";
import { randomInt } from "../utils/randoms";
import CharacterLocomotion from "./CharacterLocomotion";
import BattleBehavior from "./BattleBehavior";

@createScript("networkedWarriorController")
class NetworkedWarriorController extends ScriptTypeBase {
  state: BehavioralState
  anim: AnimComponent
  healthBar: Entity
  warrior: Warrior
  cardText: Entity
  appearEffect: Entity

  viking: Entity

  screen: Entity
  camera: Entity

  sounds: SoundComponent

  private gameTime = 0
  jobs:{time:number, job:()=>any}[]

  initialize() {
    this.jobs = []

    this.viking = mustFindByName(this.entity, 'viking')
    this.anim = this.viking.anim!

    this.sounds = mustFindByName(this.entity, "Sounds").sound!
    this.healthBar = mustFindByName(this.entity, 'HealthBar')
    this.camera = mustFindByName(this.app.root, 'Camera')
    this.screen = mustFindByName(this.entity, 'PlayerNameScreen')
    this.cardText = mustFindByName(this.entity, 'CardInPlay')
    this.appearEffect = mustFindByName(this.app.root, 'PlayerAppearEffect')
    this.entity.once('newWarrior', () => {
      this.playAppearEffect()
    })
    this.entity.on('playAppearEffect', () => {
      this.playAppearEffect()
    })
  }

  update(dt: number) {
    if (!this.warrior) {
      return
    }
    this.gameTime += dt
    this.executeJobs()

    this.screen.lookAt(this.camera.getPosition())
    this.screen.rotateLocal(0, 180, 0)
    this.healthBar.element!.width = this.warrior!.currentHealth / this.warrior!.initialHealth * 150

    this.handleBattleEffects()

    // const position = this.entity.getPosition()
    // // if (position.distance(this.serverPosition) > 1) {
    // //   this.entity.setPosition(this.serverPosition.x, 0, this.serverPosition.z)
    // // }
    // // if (this.speed > 0 && this.serverPosition && position.distance(this.serverPosition) > 0.1) {
    // //   const current = this.entity.getPosition()
    // //   const vector = new Vec3().sub2(this.serverPosition, current).normalize().mulScalar(this.speed * dt)
    // //   vector.y = 0
    // //   const newPosition = current.add(vector)
    // //   // console.log(this.serverPosition, newPosition)
    // //   this.entity.setPosition(newPosition)
    // // }
  }

  handleBattleEffects() {
    this.handleImpactStrength()
    this.handleSwingDirection()   
  }

  private handleSwingDirection() {
    const slot = this.sounds.slots["SwordAgainstSword"]
    if (this.warrior.battleCommands.swingDirection > 0) {
      this.playIfNotPlaying(slot)
    } else {
      slot.stop()
    }
  }

  private handleImpactStrength() {
    const slot = this.sounds.slots["InjuredGrunt"]
    if (this.warrior.battleCommands.impactStrength > 0) {
      this.playIfNotPlaying(slot)
    } else {
      slot.stop()
    }
  }

  private playIfNotPlaying(slot:SoundSlot) {
    if (!slot.isPlaying) {
      slot.play()
    }
  }

  playAppearEffect() {
    // if (this.serverPosition) {
    //   this.entity.setPosition(this.serverPosition.x, 0, this.serverPosition.z)
    // }

    const effect = this.appearEffect.clone()
    effect.name = `player-appear-${this.entity.getGuid()}-${randomInt(100_000)}`
    this.app.root.addChild(effect)
    effect.setPosition(this.entity.getPosition())
    effect.enabled = true
    mustGetScript<any>(effect, 'effekseerEmitter').play()
    this.jobs.push({
      time: this.gameTime + 6,
      job: () => {
        effect.destroy()
      }
    })
  }

  executeJobs() {
    if (this.jobs.length > 0) {
      const toDelete:number[] = []
      this.jobs.forEach((job, i) => {
        if (job.time <= this.gameTime) {
          toDelete.push(i)
          job.job()
        }
      })
      toDelete.forEach((i) => {
        this.jobs = this.jobs.splice(i,1)
      })
    }
  }

  setState(newState: BehavioralState) {
    if (this.state === newState) {
      return
    }
    console.log('set state: ', newState, this.entity.name)
    this.state = newState
    if (newState !== BehavioralState.battle) {
      this.anim.setBoolean('battling', false)
    }
    switch (newState) {
      case BehavioralState.move:
        this.anim.setFloat('health', 100)
        return
      case BehavioralState.taunt:
        this.anim.setFloat('health', 100)
        return
      case BehavioralState.dead:
        this.anim.setFloat('health', 0)
        return
      case BehavioralState.battle:
        this.anim.setBoolean('battling', true)
        return
    }
  }

  private handleAvatar() {
    console.log("handle avatar")
    const name = `RPM_${this.warrior.id}`
    const url = `${this.warrior.avatar}?quality=low&cacheBuster=${randomInt(10000)}`
    const rpm = mustFindByName(this.app.root, "ReadyPlayerMeTemplate").clone()
    rpm.name = `avatar_${this.warrior.id}`
    const axe = mustFindByName(rpm, "Axe")
    const shield = mustFindByName(rpm, "Shield")
    this.entity.addChild(rpm)
    rpm.setLocalPosition(0, 0.1, 0)
    rpm.setLocalEulerAngles(0, 180, 0)

    loadGlbContainerFromUrl(this.app, url, null, name, (err: any, asset: pc.Asset) => {
      console.log("avatar loaded")
      if (err) {
        console.error("error loading avatar: ", err)
        return //TODO: retry?
      }
      const renderRootEntity = asset.resource.instantiateRenderEntity();
      rpm.addChild(renderRootEntity);

      mustFindByName(renderRootEntity, "RightHand").addChild(axe)
      mustFindByName(renderRootEntity, "LeftForeArm").addChild(shield)

      const old = this.viking

      rpm.enabled = true
      axe.enabled = true
      shield.enabled = true
      if (!rpm.anim) {
        console.error(rpm, rpm.anim)
        throw new Error("missing anim")
      }
      rpm.anim.enabled = true
      mustGetScript<CharacterLocomotion>(this.entity, 'characterLocomotion').animatedEntity = rpm
      mustGetScript<BattleBehavior>(this.entity, 'battleBehavior').setup(this.warrior.battleCommands, rpm.anim)

      this.anim = rpm.anim
      this.viking = rpm

      old.destroy()
    })
  }

  setWarrior(warrior: Warrior) {
    this.warrior = warrior
    console.log('player set', warrior.toJSON())

    mustGetScript<CharacterLocomotion>(this.entity, 'characterLocomotion').setLocomotion(warrior.locomotion)

    if (warrior.avatar) {
      this.handleAvatar()
    } else {
      const torso = mustFindByName(this.entity, 'Wolf3D_Avatar')

      const newMaterial = torso.render!.meshInstances[0].material.clone()
      const color = warrior.color.toArray()
        ; (newMaterial as any).diffuse.set(color[0], color[1], color[2])
      newMaterial.update()
      torso.render!.meshInstances[0].material = newMaterial
    }

    warrior.onChange = (_changes) => {
      // console.log("changes: ", _changes)
      this.setState(warrior.behavioralState)
      if (!!warrior.currentItem) {
        this.cardText.enabled = true
        this.cardText.element!.text = `(${warrior.currentItem.name})`
      } else {
        this.cardText.enabled = false
      }
    }
    mustGetScript<BattleBehavior>(this.entity, 'battleBehavior').setup(warrior.battleCommands, this.anim)

    this.entity.fire('newWarrior', warrior)
  }
}

export default NetworkedWarriorController;
