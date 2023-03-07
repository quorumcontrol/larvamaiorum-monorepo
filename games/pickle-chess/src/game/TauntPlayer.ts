import { Messages, TauntMessage } from "../syncing/schema/PickleChessState";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { createScript } from "../utils/createScriptDecorator";

@createScript("tauntPlayer")
class TauntPlayer extends ScriptTypeBase {
    audio: HTMLAudioElement
    queue: string[]

    initialize() {
        this.queue = []
        this.audio = new Audio()
        this.audio.volume = 0.5
        this.app.on(Messages.taunt, (msg: TauntMessage) => {
            this.handleAudio(msg.audio)
        })
        this.audio.addEventListener("ended", () => {
            // call handle ended
            this.handleEnded()
        })
    }

    private handleEnded() {
        if (this.queue.length > 0) {
            this.playAudio(this.queue.shift()!)
        }
    }

    private handleAudio(url: string) {
        this.queue.push(url)
        if (this.audio.paused) {
            this.playAudio(this.queue.shift()!)
        }
    }

    private playAudio(url: string) {
        this.audio.src = url
        this.audio.play()
    }
}

export default TauntPlayer
