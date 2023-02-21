import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { createScript } from "../utils/createScriptDecorator";
import mustGetScript from "../utils/mustGetScript";

@createScript("backgroundEffect")
class BackgroundEffect extends ScriptTypeBase {
    effect: any

    initialize() {
        this.effect = mustGetScript(this.entity, "effekseerEmitter")
        this.app.on("newRoom", () => {
            this.effect.play()
        })
    }

}

export default BackgroundEffect
