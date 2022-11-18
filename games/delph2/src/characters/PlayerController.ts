import { Entity } from "playcanvas";
import { createScript } from "../utils/createScriptDecorator";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import mustFindByName from "../utils/mustFindByName";

@createScript("playerController")
class PlayerController extends ScriptTypeBase {
  camera: Entity
  screen: Entity

  initialize() {
    this.camera = mustFindByName(this.app.root, 'Camera')
    this.screen = mustFindByName(this.entity, 'PlayerNameScreen')
  }

  // update() {
  //   this.screen.lookAt(this.camera.getPosition())
  //   this.screen.rotateLocal(0, 180, 0)
  // }

}

export default PlayerController;
