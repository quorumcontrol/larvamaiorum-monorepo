import { Entity, SoundComponent, Vec3 } from "playcanvas";
import Battle, { BattleTickReport } from "../boardLogic/Battle";
import { ScriptTypeBase } from "../types/ScriptTypeBase";

import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";
import { TICK_EVT } from "../utils/rounds";
import SimpleSyncher from "../utils/singletonQueue";

@createScript("battleUI")
class BattleUI extends ScriptTypeBase {
  xSize: number;
  zSize: number;

  battle?: Battle
  textTemplate: Entity; // for now
  playerMarkerTemplate: Entity
  soundComponent: SoundComponent
  singleton:SimpleSyncher

  initialize() {
    this.singleton = new SimpleSyncher('battleUi')
    this.handleTick = this.handleTick.bind(this);
    if (!this.entity.render) {
      throw new Error("no render");
    }

    const tileBoundingBox = this.entity.render.meshInstances[0].aabb;
    this.xSize = tileBoundingBox.halfExtents.x * 0.8;
    this.zSize = tileBoundingBox.halfExtents.z * 0.8;

    this.textTemplate = mustFindByName(this.entity, "Text");
    this.textTemplate.enabled = false;
    const templates = mustFindByName(this.app.root, 'Templates')
    this.playerMarkerTemplate = mustFindByName(templates, 'PlayerMarker')
    const soundComponent = mustFindByName(this.entity, "Sound").findComponent('sound') as SoundComponent
    if (!soundComponent) {
      throw new Error('missing sound component for battle')
    }
    this.soundComponent = soundComponent
    // Object.values((mustFindByName(this.entity, 'Announcer').findComponent('sound') as SoundComponent).slots)[0].play()
  }

  destroy() {
    if (this.battle) {
      this.battle.off(TICK_EVT, this.handleTick)
    }
    Object.values(this.soundComponent.slots).forEach((slot) => {
      slot.stop()
    })

    this.entity.destroy()
  }

  handleTick(tick:BattleTickReport) {
    tick.rolls.forEach((roll) => {
      this.singleton.push(() => {
        return new Promise<void>((resolve) => {
          const damageString = roll.attackRoll > roll.defenseRoll ? `${roll.attackRoll - roll.defenseRoll} damage` : 'blocked'
          const text = `${roll.attacker.name} attacks ${roll.defender.name}. ${damageString}`
          const textElement = this.textTemplate.clone() as Entity
          textElement.enabled = true
          this.entity.addChild(textElement)
          textElement.element!.text = text    
          textElement.setLocalScale(0.04, 4, 0.04)
          textElement.setLocalPosition(0,50,0)
          const startingPosition = textElement.getLocalPosition()
          textElement.tween(startingPosition).to({x: startingPosition.x, y: startingPosition.y + 200, z: startingPosition.z}, 5.0, pc.SineIn).start().on('complete', () => {
            textElement.destroy()
            resolve()
          })
        })
      })
    })
    
  }

  setBattle(battle: Battle) {
    this.battle = battle;
    this.battle.on(TICK_EVT, this.handleTick)
    this.initialUISetup();
  }

  initialUISetup() {
    if (!this.battle) {
      throw new Error('no battle')
    }
    Object.values(this.soundComponent.slots).forEach((slot) => {
      slot.play()
    });
    this.battle.warriors.forEach((w) => w.emit('battleUI', this))
  }

  gridPositions() {
    const entityWorldLocation = this.entity.getPosition().clone()
    return [new Vec3(entityWorldLocation.x + 0.15, entityWorldLocation.y, entityWorldLocation.z + 0.2), new Vec3(entityWorldLocation.x - 0.15, entityWorldLocation.y, entityWorldLocation.z - 0.2)]
  }

}

export default BattleUI;
