import { Entity } from "playcanvas";
import { HudTextMessage, Messages, PickleChessState, RoomState } from "../syncing/schema/PickleChessState";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";

@createScript("hud")
class HUD extends ScriptTypeBase {
  private mainMessage: Entity
  private persistantMessage: Entity
  private state?: PickleChessState
  private messages: string[]

  private playAgainButton: Entity

  private timeSinceLastMessage = 0

  initialize() {
    this.messages = []
    this.mainMessage = mustFindByName(this.entity, 'MessageText')
    this.persistantMessage = mustFindByName(this.entity, 'PersistantMessage')
    this.playAgainButton = mustFindByName(this.entity, "PlayAgainButton")
    this.playAgainButton.element?.on('click', () => {
      if (typeof window !== "undefined") {
        window.location.reload()
      }
    })

    this.app.on("newRoom", (room) => {
      this.state = room.state
    })
    this.app.on(Messages.hudText, (message: HudTextMessage) => {
      this.queueMessage(message.text)
    }, this)
  }

  update(dt: number) {
    if (!this.state) {
      return
    }
    this.timeSinceLastMessage += dt
    if (this.timeSinceLastMessage >= 0.5 && this.messages.length >= 1) {
      this.handleMessage(this.messages.shift()!)
      this.timeSinceLastMessage = 0
    }

    if (this.state.persistantMessage) {
      this.persistantMessage.enabled = true
      this.persistantMessage.element!.text = this.state.persistantMessage
    } else {
      this.persistantMessage.enabled = false
    }
    
    if (this.state.roomState === RoomState.gameOver) {
      this.persistantMessage.enabled = false
      this.playAgainButton.enabled = false
    }
  }

  queueMessage(message: string) {
    this.messages.push(message)
  }

  handleMessage(message: string) {
    const msgEl = this.mainMessage.clone()
    msgEl.element!.text = message
    this.entity.addChild(msgEl)
    msgEl.enabled = true
    const start = msgEl.getLocalPosition()

    let opacityObj = { opacity: 1.0 }
    // the duration of this tween must be less than the next one because the next one destroys
    this.entity.tween(opacityObj).to({ opacity: 0.05 }, 3, pc.SineInOut).on('update', () => {
      msgEl.element!.opacity = opacityObj.opacity
    }).start()

    msgEl.tween(start).to({ x: start.x, y: start.y + 600, z: start.z }, 4, pc.SineOut).start().on('complete', () => {
      msgEl.destroy()
    })
  }

}

export default HUD
