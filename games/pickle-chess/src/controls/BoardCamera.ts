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
    this.app.on("newRoom", () => {
      console.log('focusing camera on the board')
      this.orbitCamera.focus(board)
    })
  }
}

export default BoardCamera
