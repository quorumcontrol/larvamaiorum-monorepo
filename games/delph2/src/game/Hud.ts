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

  cardHolder: Entity

  trackInfo: Entity
  persistantMessage: Entity
  // questIndicator: Entity

  statElements: {
    Attack: Entity
    Defense: Entity
    Health: Entity
    AttackStat: Entity
    DefenseStat: Entity
    HealthStat: Entity
  }

  previousArtwork?: Asset

  mainMessage: Entity

  messages: string[]

  timeSinceLastMessage = 0

  initialize() {
    this.messages = []

    this.cardHolder = mustFindByName(this.entity, "Cards")
    this.name = mustFindByName(this.entity, 'Name')
    this.gumpStats = mustFindByName(this.entity, 'Gump')
    this.mainMessage = mustFindByName(this.entity, 'MessageText')
    this.trackInfo = mustFindByName(this.entity, 'TrackInfo')
    this.persistantMessage = mustFindByName(this.entity, 'PersistantMessage')
    // this.questIndicator = mustFindByName(this.entity, 'QuestIndicator')

    mustFindByName(this.entity, "VolumeUp").element!.on("click", (evt: MouseEvent) => {
      evt.stopPropagation()
      this.app.fire("musicVolumeUp")
    })

    mustFindByName(this.entity, "VolumeDown").element!.on("click", (evt: MouseEvent) => {
      evt.stopPropagation()
      this.app.fire("musicVolumeDown")
    })

    this.app.on('mainHUDMessage', this.queueMessage, this)

    this.statElements = {
      Attack: mustFindByName(this.entity, "Attack"),
      Defense: mustFindByName(this.entity, "Defense"),
      Health: mustFindByName(this.entity, "Health"),
      AttackStat: mustFindByName(this.entity, "AttackStat"),
      DefenseStat: mustFindByName(this.entity, "DefenseStat"),
      HealthStat: mustFindByName(this.entity, "HealthStat")
    }
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

    // this.questIndicator.enabled = !!this.state?.currentQuest

    this.updateInventoryGraphics()

    if (this.state?.persistantMessage) {
      this.persistantMessage.enabled = true
      this.persistantMessage.element!.text = this.state.persistantMessage
    } else {
      this.persistantMessage.enabled = false
    }

    this.statElements.Attack.element!.width = 200 * (this.warrior.currentAttack / this.maxStats?.maxAttack)
    this.statElements.Defense.element!.width = 200 * (this.warrior.currentDefense / this.maxStats?.maxDefense)
    this.statElements.Health.element!.width = 200 * (this.warrior.currentHealth / this.warrior.initialHealth)
    this.statElements.AttackStat.element!.text = this.warrior.currentAttack.toString()
    this.statElements.DefenseStat.element!.text = this.warrior.currentDefense.toString()
    this.statElements.HealthStat.element!.text = `${Math.floor(this.warrior.currentHealth)} / ${this.warrior.initialHealth}`

    this.gumpStats.element!.text = `gump: ${this.warrior.wootgumpBalance}`
  }

  private updateInventoryGraphics() {
    if (!this.warrior) {
      throw new Error('must have warrior set to setup inventory')
    }
    this.warrior.inventory.forEach((inventory) => {
      const el = this.cardHolder.findByName(`${inventory.item.name}Card`) as Entity | undefined
      if (!el) {
        return
      }
      el.enabled = (inventory.quantity > 0)
    })
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
    // this.setupInventory()
  }

}

export default Hud
