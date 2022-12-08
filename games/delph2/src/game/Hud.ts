import { Asset, Entity } from 'playcanvas'
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";
import { Music, Warrior } from '../syncing/schema/DelphsTableState'

export const BERSERK_EVT = 'berserk'
const berserkIdentifier = '0x0000000000000000000000000000000000000000-2'

@createScript("hud")
class Hud extends ScriptTypeBase {
  warrior?:Warrior

  name: Entity
  stats: Entity
  berserk: Entity
  trackInfo: Entity

  previousArtwork?: Asset

  mainMessage:Entity

  initialize() {
    this.name = mustFindByName(this.entity, 'Name')
    this.stats = mustFindByName(this.entity, 'Stats')
    this.berserk = mustFindByName(this.entity, 'Berserk')
    this.mainMessage = mustFindByName(this.entity, 'MessageText')
    this.trackInfo = mustFindByName(this.entity, 'TrackInfo')

    this.berserk.element!.on('click', (evt:MouseEvent) => {
      evt.stopPropagation()
      this.app.fire(BERSERK_EVT)
      this.berserk.enabled = false
    })
    this.app.on('mainHUDMessage', this.handleMessage, this)
  }

  handleMessage(message:string) {
    const msgEl = this.mainMessage.clone()
    msgEl.element!.text = message
    msgEl.enabled = true
    this.entity.addChild(msgEl)
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

  setWarrior(warrior:Warrior) {
    this.warrior = warrior
    this.name.element!.text = warrior.name
  }

  update() {
    if (!this.warrior) {
      return
    }
    const hasBerserk = this.warrior.inventory.get(berserkIdentifier)!.quantity > 0
    this.berserk.enabled = hasBerserk

    this.stats.element!.text = `
A: ${this.warrior.attack}   D: ${this.warrior.defense}
HP: ${Math.floor(this.warrior.currentHealth)} / ${this.warrior.initialHealth}

dGump: ${this.warrior.wootgumpBalance} (${this.warrior.wootgumpBalance - this.warrior.initialGump})
`.trim()
  }
}

export default Hud
