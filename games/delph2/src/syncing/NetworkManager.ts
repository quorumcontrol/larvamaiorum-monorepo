import { createScript } from "../utils/createScriptDecorator";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { Client, Room } from 'colyseus.js'
import { DelphsTableState, Vec2, Warrior } from "./schema/DelphsTableState";
import { SELECT_EVT } from "../controls";
import { Entity, RaycastResult } from "playcanvas";
import mustFindByName from "../utils/mustFindByName";
import mustGetScript from "../utils/mustGetScript";
import PlayerController from "../characters/PlayerController";

const client = new Client('ws://localhost:2567');

@createScript("networkManager")
class NetworkManager extends ScriptTypeBase {

  room?: Room<DelphsTableState>
  user: string
  gumpTemplate: Entity

  async initialize() {
    if (typeof document !== 'undefined') {
      const params = new URLSearchParams(document.location.search);
      const userName = params.get('name')!
      this.user = userName  
    }
    this.gumpTemplate = mustFindByName(this.app.root, 'wootgump')

    this.room = await client.joinOrCreate<DelphsTableState>("delphs", {name: "bobby"});
    this.room.state.warriors.onAdd = (player,key) => {
      this.handlePlayerAdd(player,key)
    }
    this.room.state.wootgump.onAdd = (location,key) => {
      this.handleGumpAdd(location, key)
    }
    this.room.state.wootgump.onRemove = (_loc, key) => {
      this.handleGumpRemove(key)
    }
    this.app.on(SELECT_EVT, (result:RaycastResult) => {
      this.room?.send('updateDestination', {x: result.point.x, z: result.point.z})
      // this.entity.fire('newDestination', result.point)
      // locoMotion.setDestination(result.point)
    })
  }

  handleGumpAdd(gumpLocation:Vec2, key:string) {
    console.log('gump add', key, gumpLocation.toJSON())
    const gump = this.gumpTemplate.clone() as Entity
    gump.name = `gump-${key}`
    this.app.root.addChild(gump)
    gump.enabled = true
    gump.setPosition(gumpLocation.x, 0, gumpLocation.z)
  }

  handleGumpRemove(id:string) {
    const gump = mustFindByName(this.app.root, `gump-${id}`)
    const start = gump.getLocalPosition()
    console.log('tweening the gump', start)
    gump.tween(start).to({x: start.x, y: start.y + 30, z: start.z}, 2.0).on('complete', () => {
      gump.destroy()
    }).start()
  }

  handlePlayerAdd(player:Warrior, key:string) {
    console.log(this.room!.sessionId)
    if (this.room?.sessionId == key) {
      console.log("I joined!")
      const playerEntity = mustFindByName(this.app.root, 'Player')
      playerEntity.enabled = true
      const script = mustGetScript<PlayerController>(playerEntity, 'playerController')
      script.setPlayer(player)
      return
    }
    //
    // A player has joined!
    //
    console.log("A player has joined! Their unique session id is", key);
  }



}

export default NetworkManager
