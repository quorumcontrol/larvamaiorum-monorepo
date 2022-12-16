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

  setItem(item:Item) {
    this.item = item
  }
}

export default CardHandler
