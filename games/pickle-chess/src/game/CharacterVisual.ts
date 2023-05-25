
import { createScript } from "../utils/createScriptDecorator";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { Entity, SoundComponent, Vec3 } from "playcanvas";
import mustFindByName from "../utils/mustFindByName";
import { Character, Messages, CharacterRemoveMessage } from "../syncing/schema/PickleChessState";
import { loadGlbContainerFromUrl } from "../utils/glbUtils";
import mustGetScript from "../utils/mustGetScript";
import { randomInt } from "../utils/randoms";

@createScript("character")
class CharacterVisual extends ScriptTypeBase {
  private highlightElement: Entity
  private characterState?: Character
  private focus: Vec3
  private serverPosition: Vec3
  private destination: Vec3
  private speedVector: Vec3

  private deathEffect:any
  private sound:SoundComponent
  private dead = false

  private unsubs: (() => void)[]

  private latency = 50 //ms

  initialize() {
    this.serverPosition = new Vec3()
    this.focus = new Vec3()
    this.destination = new Vec3()
    this.speedVector = new Vec3()

    this.highlightElement = mustFindByName(this.entity, "Highlight")
    this.deathEffect = mustGetScript(mustFindByName(this.entity, "DeathEffect"), "effekseerEmitter")
    this.sound = mustFindByName(this.entity, "Sound").sound!
    this.entity.anim?.setInteger("idleVariation", randomInt(3))
    this.unsubs = []
    this.entity.once("destroy", () => {
     this.unsubs.forEach((unsub) => unsub())
    })

    this.app.on("latencyUpdate", (latency: number) => {
      this.latency = latency
    })

    this.app.on(Messages.characterRemove, ({id, playerId}: CharacterRemoveMessage) => {
      if (this.characterState?.playerId !== playerId) {
        setTimeout(() => {
          this.entity.anim?.setTrigger("taunt", true)
        }, randomInt(300))
      }
    })
  }

  playerId() {
    return this.characterState?.playerId || ""
  }

  update(dt:number): void {
    if (!(this.characterState )) {
      return
    }
    const position = this.entity.getLocalPosition()
    this.focus.set(this.characterState.locomotion.destination.x, position.y, this.characterState.locomotion.destination.z)

    this.highlightElement.enabled = this.characterState.highlightedForPlayer.get(this.playerId()) || false
    
    // const pos = new Vec3(this.characterState.locomotion.position.x, position.y, this.characterState.locomotion.position.z)
    // this.entity.setPosition(pos)
    this.destination.set(this.characterState.locomotion.destination.x, 0, this.characterState.locomotion.destination.z)

    if (this.characterState.locomotion.speed > 0 && position.distance(this.destination) > 0.05) {
      // this.position.set(this.state.position.x, this.state.position.z)
      const vector = this.speedVector.sub2(this.destination, position).normalize().mulScalar(Math.abs(this.characterState.locomotion.speed) * dt)
      const { x, y, z } = vector.add(position)
      this.entity.setLocalPosition(x, y, z)

      // const vector = new Vec3().sub2(position, this.destination).normalize().mulScalar(this.characterState.locomotion.speed * dt)
      // console.log("vector", vector, dt)
      // this.entity.setPosition(position.add(vector))
    }
    
    if (position.distance(this.focus) > 0.06) {
      this.entity.lookAt(this.focus.x, this.focus.y, this.focus.z)
      this.entity.rotateLocal(0,180,0)
    }
  }

  setCharacter(character: Character) {
    this.characterState = character
    if (this.characterState.avatar) {
      this.handleAvatar()
    }
    this.unsubs ||= []
    this.unsubs.push(character.locomotion.listen("speed", (newSpeed) => {
      this.entity.anim!.setFloat("speed", newSpeed)
      this.entity.anim?.setInteger("idleVariation", randomInt(3))
    }))
    const position = this.entity.getLocalPosition()
    this.entity.setLocalPosition(character.locomotion.position.x, position.y, character.locomotion.position.z)
    this.unsubs.push(character.locomotion.position.listen("x", () => {
      this.handleServerPositionUpdate()
    }))
    this.unsubs.push(character.locomotion.position.listen("z", () => {
      this.handleServerPositionUpdate()
    }))
  }

  kill() {
    this.dead = true
    this.deathEffect.play()
    const currentPosition = this.entity.getLocalPosition()
    this.entity.anim!.setFloat("health", 0)
    this.sound.slots["Death"].play()
    this.entity.tween(currentPosition).to({y: -1}, 3, pc.SineInOut).start().on("complete", () => {
      this.entity.destroy()
    })
  }

  private handleServerPositionUpdate() {
    if (!(this.characterState )) {
      return
    }

    const position = this.entity.getLocalPosition()
    this.serverPosition.set(this.characterState.locomotion.position.x, position.y, this.characterState.locomotion.position.z)

    this.speedVector.sub2(position, this.serverPosition).normalize().mulScalar(this.characterState.locomotion.speed / 1000 * this.latency)
    this.serverPosition.add(this.speedVector)

    if (position.distance(this.serverPosition) > 0.12) {
      // console.log("resetting character based on server position", position.distance(this.serverPosition), position, this.serverPosition)
      this.entity.setLocalPosition(this.serverPosition.x, position.y, this.serverPosition.z)
    }
  }

  private handleAvatar() {
    if (!this.characterState) {
      throw new Error("missing character state")
    }
    console.log("handle avatar")
    const name = `RPM_${this.entity.name}`
    const url = `${this.characterState.avatar}?quality=low`

    const armature = mustFindByName(this.entity, "Armature")

    loadGlbContainerFromUrl(this.app, url, null, name, (err: any, asset: pc.Asset) => {
      console.log("avatar loaded")
      if (this.dead) {
        return // no need for any of this
      }
      if (err) {
        console.error("error loading avatar: ", err)
        return //TODO: retry?
      }
      const renderRootEntity = asset.resource.instantiateRenderEntity();
      const old = mustFindByName(this.entity, "Wolf3D_Avatar")
      // old.destroy()

      const newAvatar = mustFindByName(renderRootEntity, "Wolf3D_Avatar")
      newAvatar.render!.rootBone = old.render!.rootBone
      newAvatar.render!.rootBone = old.render!.rootBone
      armature.addChild(newAvatar)

      const transparent = renderRootEntity.findByName("Wolf3D_Avatar_Transparent")
      if (transparent) {
        transparent.render!.rootBone = old.render!.rootBone
        armature.addChild(transparent)
      }

      old.destroy()
    })
  }
}

export default CharacterVisual
