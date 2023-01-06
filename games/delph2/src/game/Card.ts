import { Entity } from 'playcanvas'
import { Item } from '../syncing/schema/DelphsTableState';
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from '../utils/mustFindByName';
import { PLAY_CARD_EVT } from './Hud';

@createScript("cardHandler")
class CardHandler extends ScriptTypeBase {
  cardDescription: Entity
  item: Item

  initialize() {
    this.cardDescription = mustFindByName(this.entity, "CardDescription")
    this.entity.element!.on("mouseenter", () => {
      this.cardDescription.enabled = true
    })

    this.entity.element!.on("mouseleave", () => {
       this.cardDescription.enabled = false
    })

    this.entity.element!.on('click', (evt:MouseEvent) => {
      evt.stopPropagation()
      if (!this.item) {
        return
      }
      this.app.fire(PLAY_CARD_EVT, this.item)
    })
  }

  loadArt(artUrl:string) {
    const art = new pc.Asset(artUrl, "texture", {
      url: artUrl,
    })
    art.on('error', (err) => {
      console.error(`error loading card artwork ${artUrl}: `, err)
    })
    art.on('load', () => {
      this.entity.element!.texture = art.resource
    })
    this.app.assets.load(art)
  }

  setItem(item:Item) {
    this.loadArt(item.art)
    this.item = item
    if (item.costToPlay) {
      const costToPlayEntity = mustFindByName(this.entity, "CostToPlayBackground")
      mustFindByName(costToPlayEntity, "CostToPlay").element!.text = `${item.costToPlay} $GUMP`
      costToPlayEntity.enabled = true
      
    }
  }
}

export default CardHandler
