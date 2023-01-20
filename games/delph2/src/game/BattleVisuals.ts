import { Entity, SoundComponent } from 'playcanvas'
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";
import { Battle,} from '../syncing/schema/DelphsTableState'
import mustGetScript from '../utils/mustGetScript';
import NetworkedWarriorController from '../characters/NetworkedWarriorController';
import BattleBehavior from '../characters/BattleBehavior';

type AnyFunc = ()=>any

@createScript("battleVisuals")
class BattleVisuals extends ScriptTypeBase {
  
  effect:any
  battlers: Entity[]

  sound: SoundComponent

  private _destroys:AnyFunc[]

  initialize() {
    this._destroys = []
    this.sound =  mustFindByName(this.entity, "BattleSound").sound!
    this.entity.on("destroy", () => {
      this._destroys.forEach((func) => func())
    })
  }

  private onDestroy(func:AnyFunc) {
    this._destroys.push(func)
  }

  setState(battle:Battle, allBattlers: Record<string, Entity>) {
    this.entity.setPosition(battle.center.x, 0, battle.center.z)
    this.battlers = battle.warriorIds.map((id) => {
      return allBattlers[id]
    }).filter((b) => !!b)

    if (this.battlers.length < battle.warriorIds.length) {
      console.error("could not find all battlers in: ", battle.toJSON())
      // this.entity.destroy()
      return
    }

    this.battlers.forEach((battler, i) => {
      const opponent = this.battlers[(i+1) % this.battlers.length]
      const opponentScript = mustGetScript<BattleBehavior>(opponent, "battleBehavior")
      const battlerScript = mustGetScript<BattleBehavior>(battler, "battleBehavior")

      const handleImpact = () => {
        battlerScript.anim.setTrigger('impact', true)
      }
      opponentScript.anim.on("impact", handleImpact)
      this.onDestroy(() => {
        opponentScript.anim.off("impact", handleImpact)
      })
    })

    // this.playEffects()
  }
}

export default BattleVisuals