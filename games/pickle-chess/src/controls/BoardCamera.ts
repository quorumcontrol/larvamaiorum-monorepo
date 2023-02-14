import { Room } from "colyseus.js";
import { Vec3 } from "playcanvas";
import { PickleChessState } from "../syncing/schema/PickleChessState";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";
import mustGetScript from "../utils/mustGetScript";

@createScript("boardCamera")
class BoardCamera extends ScriptTypeBase {
  orbitCamera: any

  initialize() {
    this.orbitCamera = mustGetScript(this.entity, "orbitCamera2")
    const board = mustFindByName(this.app.root, "Board")
    this.app.on("newRoom", (_room:Room<PickleChessState>) => {
      console.log('focusing camera on the board')
      this.orbitCamera.focus(board)
      this.orbitCamera.pivotPoint = new Vec3(5,0,5)
    })
  }
}

export default BoardCamera
