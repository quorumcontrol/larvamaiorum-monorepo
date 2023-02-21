import { randomInt } from "../utils/randoms";
import { SoundComponent } from "playcanvas";
import { Messages } from "../syncing/schema/PickleChessState";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { createScript } from "../utils/createScriptDecorator";

@createScript("ambientSound")
class AmbientSound extends ScriptTypeBase {
    sound: SoundComponent

    initialize() {
        this.sound = this.entity.sound!
        this.app.on("newRoom", () => {
            this.sound.slots["Ambient"].play()
        })
        this.app.on(Messages.characterRemove, () => {
            this.sound.slots[`Cheer${randomInt(3) + 1}`].play()
        })
    }

}

export default AmbientSound
