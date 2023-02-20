import { Messages, TauntMessage } from "../syncing/schema/PickleChessState";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { createScript } from "../utils/createScriptDecorator";

@createScript("tauntPlayer")
class TauntPlayer extends ScriptTypeBase {
    audio: HTMLAudioElement

    initialize() {
        this.audio = new Audio()
        this.app.on(Messages.taunt, (msg: TauntMessage) => {
            this.handleAudio(msg.audio)
        })
    }

    private handleAudio(url: string) {
        this.audio.src = url
        this.audio.play()
    }
}

export default TauntPlayer
