import { Entity, Tween } from "playcanvas";
import { ScriptTypeBase } from "../types/ScriptTypeBase";

import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";
import pulser from "../utils/pulser";
import { TickEvent, TICK_EVT, CARD_CLICK_EVT, CARD_ERROR_EVT, WARRIOR_SETUP_EVT } from "./GameController";


@createScript("cardHandler")
class CardHandler extends ScriptTypeBase {

  thieve: Entity
  berserk: Entity

  started = false
  pending?: Entity
  currentCard?:Entity

  pendingTween?: Tween

  initialize() {
    this.app.on(TICK_EVT, this.handleTick, this)
    this.app.on(CARD_ERROR_EVT, this.handleCardError, this)
    this.thieve = mustFindByName(this.entity, "Thieve")
    this.berserk = mustFindByName(this.entity, "Berserk")
    this.thieve.element?.on('click', () => this.handleClick('thieve'))
    this.berserk.element?.on('click', () => this.handleClick('berserk'))
  }

  handleClick(cardName:'thieve'|'berserk') {
    if (!this.canSelect()) {
      return
    }
    console.log('click! ', cardName)
    this.app.fire(CARD_CLICK_EVT, cardName)
    this.app.once(WARRIOR_SETUP_EVT, () => {
      this.started = true
    })
    const card = this.cardFromName(cardName)
    this.pending = card
    if (this.pendingTween) {
      this.pendingTween.stop()
    }
    console.log('pulsing', card)
    card.translateLocal(0,0,125)
    this.pendingTween = pulser(card, 50, 1)
  }

  handleTick(evt: TickEvent) {
    const { tick, currentPlayer } = evt
    if (!currentPlayer) {
      return
    }
    const warrior = tick.ranked.find((w) => w.id === currentPlayer)
    if (!warrior) {
      throw new Error('missing warrior')
    }

    if (warrior.currentItem) {
      const card = this.cardFromId(warrior.currentItem.id)
      this.currentCard = card
    } else {
      this.currentCard = undefined
    }

    // TODO: allow arbitrary inventory
    Object.values(warrior.inventory).forEach((i) => {
      if (i.quantity === 0) {
        this.cardFromId(i.item.id).enabled = false
      }
    })
  }

  handleCardError() {
    if (this.pendingTween) {
      this.pendingTween.stop()
    }
    this.pending!.translateLocal(0,0,-125)
    this.pending = undefined
  }

  private canSelect() {
    return this.started && !this.pending && !this.currentCard
  }

  private cardFromName(card:'thieve'|'berserk') {
    switch(card) {
      case 'thieve':
        return this.thieve
      case 'berserk':
        return this.berserk
      default:
        throw new Error('unknown card')
    }
  }

  private cardFromId(card:number) {
    switch(card) {
      case 3:
        return this.thieve
      case 2:
        return this.berserk
      default:
        throw new Error('unknown card')
    }
  }

}

export default CardHandler
