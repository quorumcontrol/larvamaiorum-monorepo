import { Entity, SineInOut, Tween } from "playcanvas";
import HelpText from "../appWide/HelpText";
import { CellOutComeDescriptor } from "../boardLogic/Cell";
import { TickOutput } from "../boardLogic/Grid";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { GameConfig, getGameConfig } from "../utils/config";

import { createScript } from "../utils/createScriptDecorator";

import mustFindByName from "../utils/mustFindByName";
import { GAME_OVER_EVT, NO_MORE_MOVES_EVT, ORCHESTRATOR_TICK, SECONDS_BETWEEN_ROUNDS, STOP_MOVES_BUFFER, TICK_EVT } from "../utils/rounds";

@createScript("hud")
class Hud extends ScriptTypeBase {
  uiText: Entity;
  eventTemplate: Entity;

  roundText: Entity
  roundTimer: Entity
  roundFadeTween?: Tween

  inProgress?: Promise<any>

  timeToNextRound = -1;

  initialize() {
    this.uiText = mustFindByName(this.entity, "Status");
    this.eventTemplate = mustFindByName(this.entity, "Event");
    this.roundTimer = mustFindByName(this.entity, "RoundTimer")
    this.roundText = mustFindByName(this.entity, "RoundText")
    this.eventTemplate.enabled = false;

    const controller = getGameConfig(this.app.root).controller
    controller.on(TICK_EVT, this.handleTick, this);
    controller.on(NO_MORE_MOVES_EVT, this.handleNoMoreMoves, this);
    controller.on(GAME_OVER_EVT, this.handleGameOver, this);
    controller.on(ORCHESTRATOR_TICK, (data) => {
      console.log('orchestrator tick', data)
    })

    const helpScreenScript = this.getScript<HelpText>(mustFindByName(this.app.root, 'HelpScreen'), 'helpText')
    mustFindByName(this.entity, 'HelpButton').button?.on('click', () => {
      helpScreenScript?.show()
    })
    mustFindByName(this.entity, "FullScreenButton").button?.on('click', () => {
      parent.postMessage(JSON.stringify({
        type: 'fullScreenClick',
        data: [],
      }), '*')
    })
  }

  update(dt: number) {
    if (this.timeToNextRound > 0) {
      this.timeToNextRound -= dt
      this.updateRoundTimerText()
    }
  }

  private handleNoMoreMoves() {
    if (this.timeToNextRound === -1) {
      return // idempotent
    }
    this.timeToNextRound = -1
    this.updateRoundText('No more moves')
    this.roundTimer.element!.text = `No more moves`
  }

  private updateRoundTimerText() {
    if (this.timeToNextRound < 0) {
      return
    }

    this.roundTimer.element!.text = `Choose moves for ${Math.ceil(this.timeToNextRound)}s`
  }

  private handleGameOver() {
    this.timeToNextRound = -1
    this.roundTimer.element!.text = ''
  }

  private updateRoundText(txt: string) {
    if (this.roundFadeTween) {
      this.roundFadeTween.stop()
    }
    this.roundText.element!.text = txt
    let opacity = { value: 1.0 }
    this.roundText.element!.opacity = opacity.value

    this.roundFadeTween = this.entity.tween(opacity).to({ value: 0.0 }, 4.0, SineInOut).on('update', () => {
      this.roundText.element!.opacity = opacity.value
    }).start()
  }

  rank(config: GameConfig, _tickOutput: TickOutput) {
    if (!config.currentPlayer || !config.grid) {
      return -1
    }
    const sorted = config.grid.warriors.sort((a, b) => {
      return b.wootgumpBalance - a.wootgumpBalance
    })
    return sorted?.indexOf(config.currentPlayer) + 1
  }

  handleTick(tickOutput: TickOutput) {
    const config = getGameConfig(this.app.root);
    const grid = config.grid;
    this.timeToNextRound = (SECONDS_BETWEEN_ROUNDS - STOP_MOVES_BUFFER - 2) // show the user a shorter period of time
    this.updateRoundText(`Round ${tickOutput.tick} of ${grid?.gameLength}`)
    const player = config.currentPlayer
    if (!grid) {
      return;
    }
    let text = `Round ${grid.tick}/${grid.gameLength}`
    if (config.currentPlayer) {
      text += ` - Rank: ${this.rank(config, tickOutput)} - ${config.currentPlayer.wootgumpBalance} Wootgump`
    }
    this.uiText.element!.text = text;


    // lets see if anything happened to the player themselves
    const events = this.getInterestingEvents(tickOutput.outcomes, player?.id)
    console.log('interesting: ', events)
    events.forEach(this.playEvent.bind(this))

    if (config.grid?.isOver()) {
      const gameOver = mustFindByName(this.entity, "GameOver");
      gameOver.enabled = true;

      if (player) {
        const endGameStats = mustFindByName(this.entity, "EndGameStats")
        endGameStats.enabled = true;
        endGameStats.element!.text = `You harvested ${player.wootgumpBalance} Wootgump.`
      }
    }
  }

  private playEvent(eventText: string) {
    const playEvent = () => {
      return new Promise<void>((resolve, reject) => {
        try {
          console.log('playing event', eventText)
          const eventElement = this.eventTemplate.clone() as Entity
          eventElement.enabled = true
          this.entity.addChild(eventElement)
          eventElement.element!.text = eventText
          const curPosition = eventElement.getLocalPosition()
          console.log(eventElement)

          let total = 0
          const duration = 3.0

          const opacity = { value: 1.0 }
          eventElement.tween(opacity).to({ value: 0.5 }, duration - 0.1, pc.SineOut).on('update', () => {
            eventElement.element!.opacity = opacity.value
          }).start()

          eventElement.tween(curPosition).to({ x: curPosition.x, y: curPosition.y + 200, z: curPosition.z }, duration, pc.SineIn).start().on('complete', () => {
            eventElement.destroy()
          }).on('update', (dt: any) => {
            total = total + dt
            if (total >= duration / 2) {
              // half way through this, let the next event pop up
              resolve()
            }
          })
        } catch (err) {
          console.error('error playing event: ', err)
          reject(err)
        }
      })
    }
    if (this.inProgress) {
      this.inProgress = this.inProgress.then(playEvent.bind(this))
      return
    }
    this.inProgress = playEvent.bind(this)()
  }

  private getInterestingEvents(outcomes: CellOutComeDescriptor[][], player?: string): string[] {
    let interestingEvents: string[] = []
    outcomes.forEach((row) => {
      row.forEach((outcome) => {
        if (player && outcome.harvested[player]?.length > 0) {
          interestingEvents.push(`You harvested ${outcome.harvested[player].length} Wootgump`)
        }
        outcome.battleTicks.forEach((battleTick) => {
          if (battleTick.tick === battleTick.startingTick) {
            interestingEvents.push(`${battleTick.attacker.name} battles ${battleTick.defender.name}`)
          }
          if (battleTick.isOver) {
            return interestingEvents.push(`${battleTick.winner?.name} defeats ${battleTick.loser?.name}`)
          }
          if (player && (battleTick.attacker.id === player || battleTick.defender.id === player)) {
            if (battleTick.attackRoll > battleTick.defenseRoll) {
              return interestingEvents.push(`${battleTick.attacker.name} attacks ${battleTick.defender.name} for ${battleTick.attackRoll - battleTick.defenseRoll} damage.`)
            }
            interestingEvents.push(`${battleTick.defender.name} blocks ${battleTick.attacker.name}.`)
          }

        })
      })
    })
    return interestingEvents

  }

}

export default Hud;
