import { Entity, SineInOut, Tween, SoundComponent } from "playcanvas";
import HelpText from "../appWide/HelpText";
import { CellOutComeDescriptor } from "../boardLogic/Cell";
import { TickOutput } from "../boardLogic/Grid";
import Warrior from "../boardLogic/Warrior";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { GameConfig, getGameConfig } from "../utils/config";

import { createScript } from "../utils/createScriptDecorator";

import mustFindByName from "../utils/mustFindByName";
import { GAME_OVER_EVT, NO_MORE_MOVES_EVT, SECONDS_BETWEEN_ROUNDS, STOP_MOVES_BUFFER, TICK_EVT } from "../utils/rounds";
import SimpleSyncher from "../utils/singletonQueue";

@createScript("hud")
class Hud extends ScriptTypeBase {
  uiText: Entity;
  eventTemplate: Entity;

  roundText: Entity
  roundTimer: Entity
  roundFadeTween?: Tween

  miniQuestText: Entity
  miniQuestTween?: Tween

  soundPlayer: SoundComponent

  singleton: SimpleSyncher

  timeToNextRound = -1;

  initialize() {
    this.singleton = new SimpleSyncher('hud')
    this.uiText = mustFindByName(this.entity, "Status");
    this.eventTemplate = mustFindByName(this.entity, "Event");
    this.roundTimer = mustFindByName(this.entity, "RoundTimer")
    this.roundText = mustFindByName(this.entity, "RoundText")
    this.miniQuestText = mustFindByName(this.entity, "MiniQuestText")
    this.eventTemplate.enabled = false;

    const controller = getGameConfig(this.app.root).controller
    controller.on(TICK_EVT, this.handleTick, this);
    controller.on(NO_MORE_MOVES_EVT, this.handleNoMoreMoves, this);
    controller.on(GAME_OVER_EVT, this.handleGameOver, this);

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
    mustFindByName(this.entity, "PlayCard").button?.on('click', () => {
      parent.postMessage(JSON.stringify({
        type: 'playCardClick',
        data: [],
      }), '*')
    })


    const component = mustFindByName(this.entity, 'Sound').findComponent('sound') as SoundComponent
    if (!component) {
      throw new Error('no sound component')
    }
    this.soundPlayer = component

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

  private updateMiniQuestText(txt: string) {
    if (this.miniQuestTween) {
      this.miniQuestTween.stop()
    }
    this.miniQuestText.element!.text = txt
    let opacity = { value: 1.0 }
    this.miniQuestText.element!.opacity = opacity.value

    this.miniQuestTween = this.entity.tween(opacity).to({ value: 0.0 }, 4.0, SineInOut).on('update', () => {
      this.miniQuestText.element!.opacity = opacity.value
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

  private handleFirstGump(tickOutput: TickOutput, player?: Warrior) {
    if (!player || !tickOutput.quests.firstGump) {
      return
    }

    if (tickOutput.quests.firstGump === player) {
      this.updateMiniQuestText('first gump!')
      this.soundPlayer.slot('firstGump')?.play()
    }
  }

  private handleFirstBlood(tickOutput: TickOutput, player?: Warrior) {
    if (!player || !tickOutput.quests.firstBlood) {
      return
    }

    if (tickOutput.quests.firstBlood === player) {
      this.updateMiniQuestText('first blood!')
      // TODO: play first blood sound.
    }
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

    this.handleFirstGump(tickOutput, player)
    this.handleFirstBlood(tickOutput, player)

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
    this.singleton.push(() => {
      return playEvent.bind(this)()
    })
  }

  private getInterestingEvents(outcomes: CellOutComeDescriptor[][], player?: string): string[] {
    let interestingEvents: string[] = []
    outcomes.forEach((row) => {
      row.forEach((outcome) => {
        if (player && outcome.harvested[player]?.length > 0) {
          interestingEvents.push(`You harvested ${outcome.harvested[player].length} Wootgump`)
        }
        outcome.battleTicks.forEach((battleTick) => {
          const warriors = [battleTick.rolls[0].attacker, battleTick.rolls[0].defender]
          if (battleTick.tick === battleTick.startingTick) {
            interestingEvents.push(`${warriors[0].name} battles ${warriors[1].name}`)
          }
          if (battleTick.isOver) {
            if (battleTick.winner?.id === player) {
              this.soundPlayer.slot('youWon')?.play()
            }
            if (battleTick.loser?.id === player) {
              this.soundPlayer.slot('youLost')?.play()
            }
            return interestingEvents.push(`${battleTick.winner?.name} defeats ${battleTick.loser?.name}`)
          }
          if (player && warriors.map((w) => w.id).includes(player)) {
            battleTick.rolls.forEach((roll) => {
              if (roll.attackRoll > roll.defenseRoll) {
                return interestingEvents.push(`${roll.attacker.name} attacks ${roll.defender.name} for ${roll.attackRoll - roll.defenseRoll} damage.`)
              }
              interestingEvents.push(`${roll.defender.name} blocks ${roll.attacker.name}.`)
            })
          }
        })
      })
    })
    return interestingEvents

  }

}

export default Hud;
