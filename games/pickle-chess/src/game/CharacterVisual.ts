
import { createScript } from "../utils/createScriptDecorator";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { Entity } from "playcanvas";
import mustFindByName from "../utils/mustFindByName";
import { Character } from "../syncing/schema/PickleChessState";

@createScript("character")
class CharacterVisual extends ScriptTypeBase {
  private highlightElement: Entity

  private characterState?: Character

  private playerId?: string

  initialize() {
    this.highlightElement = mustFindByName(this.entity, "Highlight")
  }

  update(): void {
    if (!(this.characterState && this.playerId)) {
      return
    }
    this.highlightElement.enabled = this.characterState.highlightedForPlayer.get(this.playerId) || false
    const serverPosition = this.characterState.locomotion.position
    this.entity.setPosition(serverPosition.x, 0.1, serverPosition.z)
  }

  setCharacter(character: Character, playerId: string) {
    this.characterState = character
    this.playerId = playerId
  }
}

export default CharacterVisual
