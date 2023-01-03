import { Entity, RaycastResult, ScriptComponent, Vec3 } from "playcanvas";
import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";
import { ScriptTypeBase } from "../types/ScriptTypeBase";

@createScript("followPlayer")
class FollowPlayer extends ScriptTypeBase {
    orbitCamera: any
    player: Entity

    initialize(): void {
      this.orbitCamera = this.getScript(this.entity, 'orbitCamera2')!
      this.player = mustFindByName(this.app.root, 'Player')
    }

    update() {
      this.orbitCamera.focus(this.player)
    }
}

export default FollowPlayer;
