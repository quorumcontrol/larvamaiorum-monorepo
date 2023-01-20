import { Asset, Entity } from 'playcanvas'
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";
import { DelphsTableState, MaxStats, Warrior } from '../syncing/schema/DelphsTableState'

export const PLAY_CARD_EVT = "playCard"
export const CHOOSE_STRATEGY_EVT = "chooseStrategy"

@createScript("hud")
class Hud extends ScriptTypeBase {
  warrior?: Warrior
  maxStats?: MaxStats
  state?: DelphsTableState

  name: Entity
  gumpStats: Entity

  persistantMessage: Entity
  // questIndicator: Entity

  previousArtwork?: Asset

  mainMessage: Entity

  messages: string[]

  timeSinceLastMessage = 0

  initialize() {
    this.messages = []

    this.name = mustFindByName(this.entity, 'Name')
    this.mainMessage = mustFindByName(this.entity, 'MessageText')
    this.persistantMessage = mustFindByName(this.entity, 'PersistantMessage')
    // this.questIndicator = mustFindByName(this.entity, 'QuestIndicator')

    this.app.on('mainHUDMessage', this.queueMessage, this)
  }

  update(dt: number) {
    this.timeSinceLastMessage += dt
    if (this.timeSinceLastMessage >= 0.5 && this.messages.length >= 1) {
      this.handleMessage(this.messages.shift()!)
      this.timeSinceLastMessage = 0
    }

    if (!this.warrior || !this.maxStats) {
      return
    }

    if (this.state?.persistantMessage) {
      this.persistantMessage.enabled = true
      this.persistantMessage.element!.text = this.state.persistantMessage
    } else {
      this.persistantMessage.enabled = false
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

  setWarrior(warrior: Warrior, state: DelphsTableState) {
    this.warrior = warrior
    this.maxStats = state.maxStats
    this.state = state
    this.name.element!.text = warrior.name
  }

}

export default Hud
