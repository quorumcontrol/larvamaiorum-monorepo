import { Asset, Entity } from 'playcanvas'
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";
import { DelphsTableState, MaxStats, Music, Warrior } from '../syncing/schema/DelphsTableState'

export const BERSERK_EVT = 'berserk'
export const TRAP_EVT = 'setTrap'
const berserkIdentifier = '0x0000000000000000000000000000000000000000-2'

@createScript("hud")
class Hud extends ScriptTypeBase {
  warrior?:Warrior
  maxStats?:MaxStats
  state?:DelphsTableState

  name: Entity
  gumpStats: Entity
  berserk: Entity
  trackInfo: Entity
  persistantMessage: Entity

  statElements: {
    Attack: Entity
    Defense: Entity
    Health: Entity
    AttackStat: Entity
    DefenseStat: Entity
    HealthStat: Entity
  }

  previousArtwork?: Asset

  mainMessage:Entity

  messages:string[]

  timeSinceLastMessage = 0

  initialize() {
    this.messages = []
    
    this.name = mustFindByName(this.entity, 'Name')
    this.gumpStats = mustFindByName(this.entity, 'Gump')
    this.berserk = mustFindByName(this.entity, 'Berserk')
    this.mainMessage = mustFindByName(this.entity, 'MessageText')
    this.trackInfo = mustFindByName(this.entity, 'TrackInfo')
    this.persistantMessage = mustFindByName(this.entity, 'PersistantMessage')

    this.berserk.element!.on('click', (evt:MouseEvent) => {
      evt.stopPropagation()
      this.app.fire(BERSERK_EVT)
      this.berserk.enabled = false
    })

    this.berserk.element!.on("mouseenter", () => {
      mustFindByName(this.berserk, "CardDescription").enabled = true
    })

    this.berserk.element!.on("mouseleave", () => {
      mustFindByName(this.berserk, "CardDescription").enabled = false
    })

    mustFindByName(this.entity, 'SetTrap').element!.on('click', (evt:MouseEvent) => {
      evt.stopPropagation()
      this.app.fire(TRAP_EVT)
    })

    mustFindByName(this.entity, "VolumeUp").element!.on("click", (evt:MouseEvent) => {
      evt.stopPropagation()
      this.app.fire("musicVolumeUp")
    })

    mustFindByName(this.entity, "VolumeDown").element!.on("click", (evt:MouseEvent) => {
      evt.stopPropagation()
      this.app.fire("musicVolumeDown")
    })
    
    this.app.on('mainHUDMessage', this.queueMessage, this)

    this.statElements = {
      Attack: mustFindByName(this.entity, "Attack"),
      Defense:  mustFindByName(this.entity, "Defense"),
      Health:  mustFindByName(this.entity, "Health"),
      AttackStat:  mustFindByName(this.entity, "AttackStat"),
      DefenseStat:  mustFindByName(this.entity, "DefenseStat"),
      HealthStat:  mustFindByName(this.entity, "HealthStat")
    }
  }

  update(dt:number) {
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

    const hasBerserk = this.warrior.inventory.get(berserkIdentifier)!.quantity > 0
    this.berserk.enabled = hasBerserk
    this.statElements.Attack.element!.width = 200 * (this.warrior.currentAttack / this.maxStats?.maxAttack)
    this.statElements.Defense.element!.width = 200 * (this.warrior.currentDefense / this.maxStats?.maxDefense)
    this.statElements.Health.element!.width = 200 * (this.warrior.currentHealth / this.warrior.initialHealth)
    this.statElements.AttackStat.element!.text = this.warrior.currentAttack.toString()
    this.statElements.DefenseStat.element!.text = this.warrior.currentDefense.toString()
    this.statElements.HealthStat.element!.text = `${this.warrior.currentHealth} / ${this.warrior.initialHealth}`

    this.gumpStats.element!.text = `dGump: ${this.warrior.wootgumpBalance}`
  }

  queueMessage(message:string) {
    this.messages.push(message)
  }

  handleMessage(message:string) {
    const msgEl = this.mainMessage.clone()
    msgEl.element!.text = message
    this.entity.addChild(msgEl)
    msgEl.enabled = true
    const start = msgEl.getLocalPosition()

    let opacityObj = {opacity: 1.0}
    // the duration of this tween must be less than the next one because the next one destroys
    this.entity.tween(opacityObj).to({opacity: 0.05}, 3, pc.SineInOut).on('update', () => {
      msgEl.element!.opacity = opacityObj.opacity
    }).start()

    msgEl.tween(start).to({x: start.x, y: start.y + 600, z: start.z}, 4, pc.SineOut).start().on('complete', () => {
      msgEl.destroy()
    })
  }

  setMusic(music:Music) {
    this.trackInfo.enabled = true
    if (music.artwork) {
      console.log("loading ", music.artwork)
      const musicArtwork = new pc.Asset(music.artwork, "texture", {
        url: music.artwork,
      })
      if (this.previousArtwork) {
        this.app.assets.remove(this.previousArtwork)
        this.previousArtwork = musicArtwork
      }
      musicArtwork.on('error', (err) => {
        console.error('error loading artwork: ', err)
      })
      musicArtwork.on('load', () => {
        mustFindByName(this.trackInfo, 'Artwork').element!.texture = musicArtwork.resource
      })
      this.app.assets.load(musicArtwork)
    }
    mustFindByName(this.trackInfo, 'Title').element!.text = music.name
  }

  setWarrior(warrior:Warrior, state:DelphsTableState) {
    this.warrior = warrior
    this.maxStats = state.maxStats
    this.state = state
    this.name.element!.text = warrior.name
  }

}

export default Hud
