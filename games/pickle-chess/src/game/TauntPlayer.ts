import { Entity } from "playcanvas";
import { Messages, TauntMessage } from "../syncing/schema/PickleChessState";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";

@createScript("tauntPlayer")
class TauntPlayer extends ScriptTypeBase {
    audio: HTMLAudioElement
    queue: TauntMessage[]

    subTitleHolder: Entity
    subTitleText: Entity
    background: Entity

    initialize() {
        this.queue = []
        this.audio = new Audio()
        this.audio.volume = 0.5

        this.subTitleHolder = mustFindByName(this.entity, "SubTitleHolder")
        this.subTitleText = mustFindByName(this.subTitleHolder, "SubTitles")
        this.background = mustFindByName(this.subTitleHolder, "Background")

        this.app.on(Messages.taunt, (msg: TauntMessage) => {
            this.handleMessage(msg)
        })
        this.audio.addEventListener("ended", () => {
            // call handle ended
            this.handleEnded()
        })
    }

    private handleEnded() {
        if (this.queue.length > 0) {
            this.showTaunt(this.queue.shift()!)
            return
        }
        this.subTitleHolder.enabled = false
    }

    private handleMessage(msg: TauntMessage) {
        this.queue.push(msg)
        if (this.audio.paused) {
            this.showTaunt(this.queue.shift()!)
        }
    }

    private showTaunt(message:TauntMessage) {
        this.subTitleText.element!.text = message.text
        this.subTitleHolder.enabled = true
        this.background.element!.height = this.subTitleText.element!.height + 10
        this.playAudio(message.audio)
    }

    private playAudio(url: string) {
        this.audio.src = url
        this.audio.play()
    }
}

export default TauntPlayer
