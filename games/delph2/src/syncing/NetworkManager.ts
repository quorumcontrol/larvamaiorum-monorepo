import { createScript } from "../utils/createScriptDecorator";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { Client, Room } from 'colyseus.js'
import { Battle, Deer, DeerAttack, DelphsTableState, Item, RovingAreaAttack, Trap, Vec2, Warrior } from "./schema/DelphsTableState";
import { SELECT_EVT } from "../controls";
import Hud, { CHOOSE_STRATEGY_EVT, PLAY_CARD_EVT } from '../game/Hud'
import { Entity, RaycastResult, SoundComponent, Vec3 } from "playcanvas";
import mustFindByName from "../utils/mustFindByName";
import mustGetScript from "../utils/mustGetScript";
import NetworkedWarriorController from "../characters/NetworkedWarriorController";
import NonPlayerCharacter from "../characters/NonPlayerCharacter";
import DeerLocomotion from "../characters/DeerLocomotion";
import TrapScript from "../game/Trap";
import QuestLogic from "../game/QuestLogic";
import { memoize } from "../utils/memoize";
import RovingAttack from "../game/RovingAttack";
import { BATTLE_CHANGE, WARRIOR_CHANGE } from "./changeEvents";

const client = memoize(() => {
  if (typeof document !== 'undefined') {
    const params = new URLSearchParams(document.location.search);
    if (params.get('arena')) {
      return new Client("wss://zh8smr.colyseus.de")
    }
  }
  return new Client("ws://localhost:2567")
})

const reservation = () => {
  if (typeof document === "undefined") {
    return undefined
  }
  const params = new URLSearchParams(document.location.search);
  const encodedReservation = params.get("om")
  if (encodedReservation) {
    return JSON.parse(atob(encodedReservation))
  }
  return undefined
}

const roomParams = () => {
  if (typeof document !== 'undefined') {
    const params = new URLSearchParams(document.location.search);
    const encodedMatchData = params.get("m")
    if (encodedMatchData) {
      return ["match", JSON.parse(atob(encodedMatchData))]
    }
    return ["delphs", { name: params.get("name") }]
  }
  return ["delphs", {}]
}

@createScript("networkManager")
class NetworkManager extends ScriptTypeBase {

  room?: Room<DelphsTableState>
  gumpTemplate: Entity
  treeTemplate: Entity
  deerTemplate: Entity
  trapTemplate: Entity

  battleEffect: Entity

  player?: Entity
  playerSessionId?: string
  warriors: Record<string, Entity>
  deer: Record<string, Entity>
  traps: Record<string, Entity>
  client: Client
  hudScript: Hud
  gumpSounds: SoundComponent
  currentQuest?: QuestLogic

  async initialize() {
    this.warriors = {}
    this.deer = {}
    this.traps = {}

    this.deerTemplate = mustFindByName(this.app.root, "Deer")
    this.trapTemplate = mustFindByName(this.app.root, "Trap")
    this.hudScript = mustGetScript<Hud>(mustFindByName(this.app.root, 'HUD'), 'hud')
    this.gumpSounds = mustFindByName(this.app.root, "GumpSounds").sound!
    this.battleEffect = mustFindByName(this.app.root, 'BattleEffects')
    this.client = client()

    this.gumpTemplate = mustFindByName(this.app.root, 'wootgump')
    this.treeTemplate = mustFindByName(this.app.root, 'Tree')
    const playButton = mustFindByName(this.app.root, "PlayButton")
    playButton.element!.once("mousedown", () => {
      playButton.enabled = false
      this.go()
    })
  }

  async go() {

    const res = reservation()
    if (res) {
      console.log("found reservation: ", reservation)
      this.room = await this.client.consumeSeatReservation<DelphsTableState>(res.reservation)
    } else {
      const [roomType, params] = roomParams()
      console.log("room type: ", roomType, params)
      this.room = await this.client.joinOrCreate<DelphsTableState>(roomType, params);
    }

    this.app.fire("newRoom", this.room)

    this.room.onError((error) => {
      console.error("room error", error)
    })
    this.room.onLeave((code) => {
      console.info("room leave", code)
    })

    this.room.state.warriors.onAdd = (player, key) => {
      this.app.fire(WARRIOR_CHANGE)
      this.handlePlayerAdd(player, key)
    }

    this.room.state.warriors.onRemove = (player, key) => {
      this.app.fire(WARRIOR_CHANGE)
      this.handlePlayerRemoved(key)
    }
    this.room.state.wootgump.onAdd = (location, key) => {
      this.handleGumpAdd(location, key)
    }
    this.room.state.trees.onAdd = (location, key) => {
      this.handleTreeAdd(location, key)
    }
    this.room.state.wootgump.onRemove = (_loc, key) => {
      this.handleGumpRemove(key)
    }
    this.room.state.battles.onRemove = (_loc, key) => {
      this.app.fire(BATTLE_CHANGE)
      this.handleBattleRemove(key)
    }
    this.room.state.battles.onAdd = (battle, key) => {
      console.log('firing battle change')
      this.app.fire(BATTLE_CHANGE)
      this.handleBattleAdd(battle, key)
    }

    this.room.state.deerAttacks.onAdd = (attack, key) => {
      this.handleDeerAttackAdd(attack, key)
    }

    this.room.state.deerAttacks.onRemove = (_attack, key) => {
      this.handleDeerAttackRemove(key)
    }

    this.room.state.deer.onAdd = (deer, key) => {
      this.handleDeerAdd(deer, key)
    }
    this.room.state.rovingAreaAttacks.onAdd = (attack, key) => {
      this.handleRovingAreaAttack(attack, key)
    }

    this.room.state.traps.onAdd = (trap, key) => {
      this.handleTrapAdd(trap, key)
    }
    this.room.state.traps.onRemove = (_trap, key) => {
      this.handleTrapRemove(key)
    }

    this.room.state.onChange = (changes) => {
      changes.forEach((change) => {
        if (change.field === 'questActive') {
          this.handleQuestActiveChange()
        }
      })
    }

    this.room.onMessage('mainHUDMessage', (message: string) => {
      this.app.fire('mainHUDMessage', message)
    })

    this.room.onMessage('playAppearEffect', (warriorId: string) => {
      this.warriors[warriorId]?.fire("playAppearEffect")
    })

    this.room.onMessage('gumpDiff', (amount: number) => {
      const message = amount < 0 ?
        `- ${amount * -1} gump.` :
        `+ ${amount} gump!`
      this.app.fire('mainHUDMessage', message)
      if (amount > 0) {
        for (let i = 0; i < Math.min(amount, 20); i++) {
          setTimeout(() => {
            this.gumpSounds.slots['Increase'].play()
          }, i * 100)
        }

      }
    })

    this.app.on(SELECT_EVT, (result: RaycastResult) => {
      this.room?.send('updateDestination', { x: result.point.x, z: result.point.z })
    })

    this.app.on(PLAY_CARD_EVT, (item: Item) => {
      console.log("playing card: ", item.toJSON())
      this.room?.send('playCard', item.toJSON())
    })

    this.app.on(CHOOSE_STRATEGY_EVT, (item: Item) => {
      this.room?.send(CHOOSE_STRATEGY_EVT, item.toJSON())
    })

  }

  handleQuestActiveChange() {
    if (!this.room) {
      throw new Error('missing room')
    }
    const isActive = this.room.state.questActive
    if (!isActive && !this.currentQuest) {
      return
    }
    if (this.currentQuest) {
      if (!isActive) {
        this.currentQuest.destroy()
        this.currentQuest = undefined
      } else {
        throw new Error('should not have had a change to positive while still having a current quest')
      }
      return
    }
    const quest = new QuestLogic(this.app, this.room.state, this.warriors)
    this.currentQuest = quest
    quest.go()
  }

  handleDeerAdd(deer: Deer, key: string) {
    const deerEntity = this.deerTemplate.clone()
    deerEntity.name = `deer-${key}`
    deerEntity.enabled = true
    deerEntity.setPosition(deer.position.x, 0, deer.position.z)
    this.app.root.addChild(deerEntity)
    mustGetScript<DeerLocomotion>(deerEntity, 'deerLocomotion').setDeerState(deer)
    this.deer[deer.id] = deerEntity
  }

  handleTrapAdd(trap: Trap, key: string) {
    const trapEntity = this.trapTemplate.clone()
    trapEntity.name = `trap-${key}`
    trapEntity.setPosition(trap.position.x, 0, trap.position.z)
    this.app.root.addChild(trapEntity)
    this.traps[trap.id] = trapEntity
    trapEntity.enabled = true
  }

  handleTrapRemove(key: string) {
    mustGetScript<TrapScript>(this.traps[key], "trap").trigger()
    delete this.traps[key]
  }

  handleDeerAttackAdd(attack: DeerAttack, key: string) {
    const effect = this.battleEffect.clone()
    effect.name = `deer-attack-effect-${key}`
    this.app.root.addChild(effect)
    effect.enabled = true
    this.playEffects(effect)

    const position = this.warriors[attack.warriorId].getPosition().add(this.deer[attack.deerId].getPosition()).divScalar(2)
    effect.setPosition(position)
  }

  handleDeerAttackRemove(key: string) {
    const effects = mustFindByName(this.app.root, `deer-attack-effect-${key}`)
    console.log('deer attack over', key)
    const battleSound = mustFindByName(effects, "BattleSound").findComponent('sound') as SoundComponent
    Object.values(battleSound.slots).forEach((slot) => {
      slot.stop()
    })
    effects.destroy()
  }

  handleBattleAdd(battle: Battle, key: string) {
    console.log('new battle: ', battle.toJSON())
    const effect = this.battleEffect.clone()
    effect.name = `battle-effect-${key}`
    this.app.root.addChild(effect)
    effect.enabled = true
    this.playEffects(effect)

    const warriors = battle.warriorIds.map((id) => {
      return this.warriors[id]
    })
    const position = warriors[0].getPosition().add(warriors[1].getPosition()).divScalar(2)
    effect.setPosition(position)
    warriors.forEach((warrior, i) => {
      warrior.lookAt(warriors[(i + 1) % warriors.length].getPosition())
    })
  }

  private playEffects(effects: Entity) {
    const battleSound = mustFindByName(effects, "BattleSound").findComponent('sound') as SoundComponent
    Object.values(battleSound.slots).forEach((slot) => {
      slot.play()
    })

    const emitter = mustFindByName(effects, 'BattleEffect')
    mustGetScript<any>(emitter, 'effekseerEmitter').play()
  }

  handleBattleRemove(key: string) {
    const effects = mustFindByName(this.app.root, `battle-effect-${key}`)
    console.log('battle over', key)
    const battleSound = mustFindByName(effects, "BattleSound").findComponent('sound') as SoundComponent
    Object.values(battleSound.slots).forEach((slot) => {
      slot.stop()
    })
    effects.destroy()
  }

  handleRovingAreaAttack(attack: RovingAreaAttack, key: string) {
    const attackEntity = mustFindByName(this.app.root, "RovingAttack").clone()
    attackEntity.name = `roving-attack-${key}`
    this.app.root.addChild(attackEntity)
    mustGetScript<RovingAttack>(attackEntity, "rovingAttack").setState(attack)
    attackEntity.enabled = true
  }

  handleGumpAdd(gumpLocation: Vec2, key: string) {
    // console.log('gump add', key, gumpLocation.toJSON())
    const gump = this.gumpTemplate.clone() as Entity
    gump.name = `gump-${key}`
    this.app.root.addChild(gump)
    gump.enabled = true
    gump.setPosition(gumpLocation.x, 0, gumpLocation.z)
  }

  handleTreeAdd(treeLocation: Vec2, key: string) {
    // console.log('tree add', key, treeLocation.toJSON())
    const tree = this.treeTemplate.clone() as Entity
    tree.name = `tree-${key}`
    this.app.root.addChild(tree)
    tree.enabled = true
    tree.setPosition(treeLocation.x, 0, treeLocation.z)
  }

  handleGumpRemove(id: string) {
    const gump = mustFindByName(this.app.root, `gump-${id}`)
    const start = gump.getLocalPosition()
    gump.tween(start).to({ x: start.x, y: start.y + 30, z: start.z }, 2.0).on('complete', () => {
      gump.destroy()
    }).start()
  }

  handlePlayerRemoved(key: string) {
    this.warriors[key].destroy()
    delete this.warriors[key]
  }

  handlePlayerAdd(warrior: Warrior, key: string) {
    console.log("A player has joined! Their unique session id is", key, warrior.toJSON());

    console.log(this.room!.sessionId)
    if (this.room?.sessionId == key) {
      console.log("I joined!")
      const playerEntity = mustFindByName(this.app.root, 'Player')
      playerEntity.enabled = true
      this.player = playerEntity
      Object.values(this.warriors).forEach((w) => {
        mustGetScript<NonPlayerCharacter>(w, 'nonPlayerCharacter').setPlayerEntity(playerEntity)
      })
      this.warriors[key] = playerEntity

      this.playerSessionId = key

      const script = mustGetScript<NetworkedWarriorController>(playerEntity, 'networkedWarriorController')
      script.setPlayer(warrior)
      mustGetScript<Hud>(mustFindByName(this.app.root, 'HUD'), 'hud').setWarrior(warrior, this.room!.state)

      return
    }
    //
    // A player has joined!
    //
    const warriorEntity = mustFindByName(this.app.root, 'NPC').clone()
    warriorEntity.enabled = true
    this.app.root.addChild(warriorEntity)
    const script = mustGetScript<NetworkedWarriorController>(warriorEntity, 'networkedWarriorController')
    script.setPlayer(warrior)

    if (this.player) {
      mustGetScript<NonPlayerCharacter>(warriorEntity, 'nonPlayerCharacter').setPlayerEntity(this.player)
    }
    this.warriors[key] = warriorEntity
  }
}

export default NetworkManager
