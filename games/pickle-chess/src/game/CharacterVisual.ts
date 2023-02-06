
import { createScript } from "../utils/createScriptDecorator";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { Entity, Vec3 } from "playcanvas";
import mustFindByName from "../utils/mustFindByName";
import { Character } from "../syncing/schema/PickleChessState";
import { randomInt } from "crypto";
import { loadGlbContainerFromUrl } from "../utils/glbUtils";

@createScript("character")
class CharacterVisual extends ScriptTypeBase {
  private highlightElement: Entity

  private characterState?: Character

  private playerId?: string

  private focus: Vec3

  initialize() {
    this.focus = new Vec3()
    this.highlightElement = mustFindByName(this.entity, "Highlight")
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
    if (position.distance(this.focus) > 0.05) {
      this.entity.lookAt(this.focus.x, this.focus.y, this.focus.z)
      this.entity.rotateLocal(0,180,0)
    }
    if (this.characterState.locomotion.speed > 0) {
      console.log("speed: ", this.characterState.locomotion.speed)
    }
    this.entity.anim!.setFloat("speed", this.characterState.locomotion.speed)
  }

  setCharacter(character: Character, playerId: string) {
    this.characterState = character
    this.playerId = playerId
    if (this.characterState.avatar) {
      this.handleAvatar()
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
