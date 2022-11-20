import { createScript } from "../utils/createScriptDecorator";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { Client, Room } from 'colyseus.js'
import { Battle, Deer, DelphsTableState, Vec2, Warrior } from "./schema/DelphsTableState";
import { SELECT_EVT } from "../controls";
import Hud from '../game/Hud'
import { Entity, RaycastResult, Vec3 } from "playcanvas";
import mustFindByName from "../utils/mustFindByName";
import mustGetScript from "../utils/mustGetScript";
import NetworkedWarriorController from "../characters/NetworkedWarriorController";
import NonPlayerCharacter from "../characters/NonPlayerCharacter";
import DeerLocomotion from "../characters/DeerLocomotion";

@createScript("networkManager")
class NetworkManager extends ScriptTypeBase {

  room?: Room<DelphsTableState>
  user: string
  gumpTemplate: Entity
  treeTemplate: Entity
  deerTemplate: Entity
  player?: Entity
  playerSessionId?: string
  warriors:Record<string, Entity>
  deer:Record<string, Entity>
  client: Client

  async initialize() {
    this.warriors = {}
    this.deer = {}
    this.deerTemplate = mustFindByName(this.app.root, "Deer")
    if (typeof document !== 'undefined') {
      const params = new URLSearchParams(document.location.search);
      const userName = params.get('name')!
      this.user = userName
      if (params.get('arena')) {
        this.client = new Client("wss://zh8smr.colyseus.de")
      } else {
        this.client = new Client("ws://localhost:2567")
      }
    } else {
      this.client = new Client("ws://localhost:2567")
    }
    this.gumpTemplate = mustFindByName(this.app.root, 'wootgump')
    this.treeTemplate = mustFindByName(this.app.root, 'Tree')

    this.room = await this.client.joinOrCreate<DelphsTableState>("delphs", { name: "bobby" });
    this.room.state.warriors.onAdd = (player, key) => {
      this.handlePlayerAdd(player, key)
    }

    this.room.state.warriors.onRemove = (player, key) => {
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
      this.handleBattleRemove(key)
    }
    this.room.state.battles.onAdd = (battle, key) => {
      this.handleBattleAdd(battle, key)
    }
    this.room.state.deer.onAdd = (deer, key) => {
      this.handleDeerAdd(deer, key)
    }
    this.app.on(SELECT_EVT, (result: RaycastResult) => {
      this.room?.send('updateDestination', { x: result.point.x, z: result.point.z })
    })
  }

  handleDeerAdd(deer:Deer, key: string) {
    const deerEntity = this.deerTemplate.clone()
    deerEntity.enabled = true
    deerEntity.setPosition(deer.position.x, 0, deer.position.z)
    this.app.root.addChild(deerEntity)
    mustGetScript<DeerLocomotion>(deerEntity, 'deerLocomotion').setDeerState(deer)
    this.deer[deer.id] = deerEntity
  }

  handleBattleAdd(battle:Battle, key:string) {
    console.log('new battle: ', battle.toJSON())
    const effect = mustFindByName(this.app.root, 'BattleEffect').clone()
    effect.name = `battle-effect-${key}`
    this.app.root.addChild(effect)
    effect.enabled = true
    mustGetScript<any>(effect, 'effekseerEmitter').play()
    const warriors = battle.warriorIds.map((id) => {
      return this.warriors[id]
    })
    const position = warriors[0].getPosition().add(warriors[1].getPosition()).divScalar(2)
    effect.setPosition(position)
    warriors.forEach((warrior, i) => {
      warrior.lookAt(warriors[(i + 1) % warriors.length].getPosition())
    })
  }

  handleBattleRemove(key:string) {
    console.log('battle over', key)
    mustFindByName(this.app.root, `battle-effect-${key}`).destroy()
  }

  handleGumpAdd(gumpLocation: Vec2, key: string) {
    console.log('gump add', key, gumpLocation.toJSON())
    const gump = this.gumpTemplate.clone() as Entity
    gump.name = `gump-${key}`
    this.app.root.addChild(gump)
    gump.enabled = true
    gump.setPosition(gumpLocation.x, 0, gumpLocation.z)
  }

  handleTreeAdd(treeLocation: Vec2, key: string) {
    console.log('tree add', key, treeLocation.toJSON())
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
      mustGetScript<Hud>(mustFindByName(this.app.root, 'HUD'), 'hud').setWarrior(warrior)

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
