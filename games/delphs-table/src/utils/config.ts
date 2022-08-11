import { Entity } from "playcanvas";
import BoardGenerate from "../board/BoardGenerate";
import Grid from "../boardLogic/Grid";
import Warrior from "../boardLogic/Warrior";
import mustFindByName from "./mustFindByName";

const urlParams = new URLSearchParams(window.location.search);

export const IS_DEV = Boolean(urlParams.get("debug") === "true");

export interface GameConfig {
  currentPlayer?:Warrior
  grid?: Grid
  controller: Entity
}

function mustGetScript<T>(entity: pc.Entity, scriptName: string): T {
  const script = entity.script?.get(scriptName);
  if (!script) {
    throw new Error(`[${this.entity.name}] Script ${scriptName} not found`)
  }
  return script as unknown as T;
}

export function getGameConfig(root:Entity) {
  const board = mustFindByName(root, 'GameBoard')
  const script = mustGetScript<BoardGenerate>(board, 'boardGenerate')
  return script.getGameConfig()
}
