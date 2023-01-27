import { Battle, BattlePhase, Item, BehavioralState } from '../rooms/schema/DelphsTableState'
import { ItemDescription } from './items'
import { randomFloat, randomInt } from './utils/randoms'
import Warrior from './Warrior'

class BattleLogic {
  id:string
  state: Battle

  started = false
  warriors: Warrior[]
  clock = 0
  wootgumpPot = 0

  winner?: Warrior
  losers: Warrior[]
  cardPicks: Record<string, ItemDescription>

  constructor(id:string, warriors: Warrior[], state:Battle) {
    this.id = id
    this.warriors = warriors
    this.state = state
    this.losers = []
    this.cardPicks = {}
  }

  update(dt: number) {
    if (!this.started) {
      return
    }
    this.clock += dt
    
    switch(this.state.phase) {
      case BattlePhase.strategySelect:
        // give the players 8 seconds to select their cards
        if (this.clock > 8) {
          console.log("moving battle into battling phase after ", this.clock)
          this.setPhase(BattlePhase.battling)
          this.clock = 0
        }
        return
      case BattlePhase.battling:
        if (this.clock > 2) {
          console.log('ending battle')
          this.endIt();
        }
       return
    }
  }

  setCardPick(warrior:Warrior, card:ItemDescription) {
    if (!this.isPhase(BattlePhase.strategySelect)) {
      return false
    }
    if (!this.warriors.some((w) => w === warrior)) {
      return false
    }
    if (!warrior.hasCard(card)) {
      return false
    }

    this.cardPicks[warrior.id] = card
    if (Object.values(this.cardPicks).length === this.warriors.length) {
      Object.keys(this.cardPicks).forEach((warriorId) => {
        this.state.strategies.set(warriorId, new Item(this.cardPicks[warriorId]))
      })
      this.setPhase(BattlePhase.battling)
    }
  }

  setPhase(phase:BattlePhase) {
    console.log("battle set phase: ", phase)
    this.state.assign({ phase })
  }

  isPhase(phase:BattlePhase) {
    return this.state.phase === phase
  }

  getCardWinner() {
    const warriorOne = this.warriors[0]
    const warriorTwo = this.warriors[1]
    const cardOne = this.cardPicks[warriorOne.id]
    const cardTwo = this.cardPicks[warriorTwo.id]
    if (!cardOne && !cardTwo) {
      return [undefined, 'nothing', 'nothing']
    }
    if (cardOne && !cardTwo) {
      return [warriorOne, cardOne.name, 'nothing']
    }
    if (cardTwo && !cardOne) {
      return [warriorTwo, cardTwo.name, 'nothing']
    }
    if (cardOne.identifier === cardTwo.identifier) {
      return [undefined, cardOne, cardTwo]
    }
    if (cardOne.cancels!.includes(cardTwo.name.toLowerCase())) {
      return [warriorOne, cardOne.name, cardTwo.name]
    }
    return [warriorTwo, cardTwo.name, cardOne.name]
  }

  endIt() {
    const warriors = this.warriors
   
    const [cardWinner, winningCard, losingCard] = this.getCardWinner()
    if (cardWinner) {
      warriors.forEach((w) => {
        w.sendMessage(`${winningCard} beats ${losingCard}`)
        if (w === cardWinner) {
          w.sendMessage(`You won the strategy round.`)
          return
        }
        w.sendMessage("You lost the strategy round.")
      })
    } else {
      warriors.forEach((w) => {
        w.sendMessage("No winning strategy played.")
      })
    }

    while (!warriors.some((w) => !w.isAlive())) {
      const attackerIdx = randomFloat() >= 0.5 ? 0 : 1
      const attacker = warriors[attackerIdx]
      const defender = warriors[(attackerIdx + 1) % this.warriors.length]
      const attackRoll = Math.floor(randomInt(attacker.currentAttack()) * (attacker === cardWinner ? 1 : 0.75))
      const defenseRoll = Math.floor(randomInt(defender.currentDefense()) * (defender === cardWinner ? 1 : 0.75))
      if (attackRoll > defenseRoll) {
        defender.state.currentHealth -= (attackRoll - defenseRoll)
      }
    }

    warriors.forEach((warrior, i) => {
      warrior.clearItem()
      if (warrior.isAlive()) {
        warrior.sendMessage("Winner!")
        warrior.setState(BehavioralState.move)
        this.winner = warrior
      } else {
        this.losers.push(warrior)
        const gumpTaken = Math.floor(warrior.state.wootgumpBalance * 0.5)
        warrior.incGumpBalance(gumpTaken * -1)
        warriors[(i+1) % warriors.length].incGumpBalance(gumpTaken)
        console.log("warrior dead from battle")
        warrior.dieForTime(6, "You lose.")
      }
    })
    this.setPhase(BattlePhase.completed)
  }

  go() {
    if (this.started) {
      return
    }
    console.log('battle started')
    this.started = true
    this.warriors.forEach((w, i) => {
      w.setState(BehavioralState.battle)
      w.sendMessage('Battle!')
    })
    this.setPhase(BattlePhase.strategySelect)
  }
}

export default BattleLogic
