
import { createScript } from "../utils/createScriptDecorator";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { Entity } from "playcanvas";
import mustFindByName from "../utils/mustFindByName";
import { Tile, tileTypeToEnglish } from "../syncing/schema/PickleChessState";
import { randomBounded } from "../utils/randoms";

@createScript("tile")
class TileVisual extends ScriptTypeBase {
  private highlightElement: Entity

  private tileState?: Tile

  private playerId?: string

  initialize() {
    this.highlightElement = mustFindByName(this.entity, "Highlight")
  }

  update(): void {
    if (this.tileState && this.playerId) {
      this.highlightElement.enabled = this.tileState.highlightedForPlayer.get(this.playerId) || false
    }
  }

  setTile(tile: Tile, playerId: string) {
    this.tileState = tile
    this.playerId = playerId
    mustFindByName(this.entity, tileTypeToEnglish(tile.type)).enabled = true
    this.entity.setLocalPosition(tile.x * 1.03, randomBounded(0.01), tile.y * 1.03)
  }
}

export default TileVisual
