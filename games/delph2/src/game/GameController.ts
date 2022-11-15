import { randomInt } from "../utils/randoms";
import { Entity, Vec3 } from "playcanvas";
import WarriorLocomotion from "../characters/WarriorLocomotion";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { createScript } from "../utils/createScriptDecorator";
import mustFindByName from "../utils/mustFindByName";
import PlayingField from "./PlayingField";
import Battle from "./Battle";
import randomColor from "../utils/randomColor";
import { generateFakeWarriors } from "./Warrior";
import mustGetScript from "../utils/mustGetScript";
import WarriorBehavior from "../characters/WarriorBehavior";

type BattleList = Record<string, Battle> // guid to an existing battle

interface BattleLook {
  guid: string
  warrior: Entity
  position: Vec3
}

@createScript("gameController")
class GameController extends ScriptTypeBase {

  field: Entity
  gumpTemplate: Entity
  playingField: PlayingField
  battles: BattleList

  npcTemplate: Entity

  initialize() {
    this.battles = {}
    this.gumpTemplate = mustFindByName(this.app.root, 'wootgump')

    this.field = mustFindByName(this.app.root, 'gameBoard')
    this.playingField = this.getScript(this.field, 'playingField')!
    this.npcTemplate = mustFindByName(this.app.root, 'NPC')
    this.setup()
  }

  update(dt:number) {
    if (randomInt(1000) < 24) {
      this.spawnGump()
    }
    const warriors = this.app.root.findByTag('warrior')
    const warriorsWithPositions = warriors.map((warrior):BattleLook => {
      return {
        guid: (warrior as Entity).getGuid(),
        warrior: warrior as Entity,
        position: warrior.getPosition(),
      }
    })

    const pairs:[BattleLook, BattleLook][] = []

    warriorsWithPositions.forEach((w) => {
      if (this.battles[w.guid]) {
        return
      }
      // otherwise find warriors we should battle
      warriorsWithPositions.forEach((potentialOpponent) => {
        if (potentialOpponent.guid === w.guid) {
          return
        }
        if (w.position.distance(potentialOpponent.position) < 1) {
          pairs.push([w, potentialOpponent])
        }
      })
    })

    pairs.forEach((pair) => {
      if (pair.some((w) => this.battles[w.guid])) {
        return // if any pair is already in battle, then skip
      }
      // otherwise setup a battle
      const battle = new Battle(this.app, pair.map((w) => w.warrior))
      pair.forEach((w) => {
        this.battles[w.guid] = battle
      })
    })

    // start them all
    new Set(Object.values(this.battles)).forEach((battle) => {
      battle.update(dt) // update first so that new battles that are not started can ignore the time
      battle.go()
      if (battle.completed) {
        battle.warriors.forEach((w) => {
          delete this.battles[w.getGuid()]
        })
      }
    })
  }

  setup() {
    const warriors = generateFakeWarriors(11, 'test')
    const playerEl = mustFindByName(this.app.root, 'Player')
    mustGetScript<WarriorBehavior>(playerEl, 'warriorBehavior').setWarrior(warriors[0])

    for (let warrior of warriors.slice(1)) {
      const character = this.npcTemplate.clone()

      const torso = mustFindByName(character, 'Torso')

      const newMaterial = torso.render!.meshInstances[0].material.clone();
      const color: [number, number, number] = randomColor({ format: 'rgbArray', seed: `TODO-${character.getGuid()}`, luminosity: 'light' }).map((c: number) => c / 255);
      (newMaterial as any).diffuse.set(color[0], color[1], color[2])
      newMaterial.update()
      torso.render!.meshInstances[0].material = newMaterial

      character.tags.add('warrior')
      character.enabled = true
      this.app.root.addChild(character)
      mustGetScript<WarriorBehavior>(character, 'warriorBehavior').setWarrior(warrior)

      const position = this.playingField.randomPosition()

      character.setPosition(position.x, 0, position.z)
      const script = this.getScript<WarriorLocomotion>(character, 'warriorLocomotion')
      setTimeout(() => {
        const position = this.playingField.randomPosition().mulScalar(1.25)
        position.y = 0
        script!.setDestination(position)
      }, 100)
    }

    for (let i = 0; i < 10; i++) {
      this.spawnGump()
    }

  }

  private spawnGump() {
    const gump = this.gumpTemplate.clone()
    gump.enabled = true
    this.app.root.addChild(gump)
    const position = this.playingField.randomPosition().mulScalar(1.25)
    gump.setPosition(position.x, 0, position.z)
  }

}

export default GameController;
