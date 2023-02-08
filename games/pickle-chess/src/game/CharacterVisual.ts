
import { createScript } from "../utils/createScriptDecorator";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { Entity, SoundComponent, Vec3 } from "playcanvas";
import mustFindByName from "../utils/mustFindByName";
import { Character } from "../syncing/schema/PickleChessState";
import { loadGlbContainerFromUrl } from "../utils/glbUtils";
import mustGetScript from "../utils/mustGetScript";

@createScript("character")
class CharacterVisual extends ScriptTypeBase {
  private highlightElement: Entity
  private characterState?: Character
  private playerId?: string
  private focus: Vec3
  private deathEffect:any
  private sound:SoundComponent
  private dead = false

  private unsub?: () => void


  initialize() {
    this.focus = new Vec3()
    this.highlightElement = mustFindByName(this.entity, "Highlight")
    this.deathEffect = mustGetScript(mustFindByName(this.entity, "DeathEffect"), "effekseerEmitter")
    this.sound = mustFindByName(this.entity, "Sound").sound!
    this.entity.on("destroy", () => {
      if (this.unsub) {
        this.unsub()
      }
    })
  }

  update(): void {
    if (!(this.characterState && this.playerId)) {
      return
    }
    const position = this.entity.getPosition()
    this.focus.set(this.characterState.locomotion.destination.x, position.y, this.characterState.locomotion.destination.z)

    this.highlightElement.enabled = this.characterState.highlightedForPlayer.get(this.playerId) || false
    const serverPosition = this.characterState.locomotion.position
    this.entity.setPosition(serverPosition.x, 0, serverPosition.z)
    if (position.distance(this.focus) > 0.06) {
      this.entity.lookAt(this.focus.x, this.focus.y, this.focus.z)
      this.entity.rotateLocal(0,180,0)
    }
  }

  setCharacter(character: Character, playerId: string) {
    this.characterState = character
    this.playerId = playerId
    if (this.characterState.avatar) {
      this.handleAvatar()
    }
    this.unsub = character.locomotion.listen("speed", (newSpeed) => {
      console.log("new speed", this.characterState?.id, newSpeed)
      this.entity.anim!.setFloat("speed", newSpeed)
    })
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
