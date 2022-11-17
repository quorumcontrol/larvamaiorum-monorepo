import { createScript } from "../utils/createScriptDecorator";
import { ScriptTypeBase } from "../types/ScriptTypeBase";
import { Client, Room } from 'colyseus.js'
import { DelphsTableState, Player } from "./schema/DelphsTableState";
import { SELECT_EVT } from "../controls";
import { RaycastResult } from "playcanvas";
import mustFindByName from "../utils/mustFindByName";
import mustGetScript from "../utils/mustGetScript";
import PlayerController from "../characters/PlayerController";

const client = new Client('ws://localhost:2567');

@createScript("networkManager")
class NetworkManager extends ScriptTypeBase {

  room?: Room<DelphsTableState>
  user: string

  async initialize() {
    if (typeof document !== 'undefined') {
      const params = new URLSearchParams(document.location.search);
      const userName = params.get('name')!
      this.user = userName  
    }
    this.room = await client.joinOrCreate<DelphsTableState>("delphs", {name: "bobby"});
    this.room.state.players.onAdd = (player,key) => {
      this.handlePlayerAdd(player,key)
    }
    this.app.on(SELECT_EVT, (result:RaycastResult) => {
      this.room?.send('updateDestination', {x: result.point.x, z: result.point.z})
      // this.entity.fire('newDestination', result.point)
      // locoMotion.setDestination(result.point)
    })
  }

  handlePlayerAdd(player:Player, key:string) {
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
