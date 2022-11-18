import { Room, Client } from "colyseus";
import util from 'util'
import { DelphsTableState } from "./schema/DelphsTableState";
import DelphsTableLogic from "../game/DelphsTableLogic";
import { generateFakeWarriors } from "../game/Warrior";

export class DelphsTable extends Room<DelphsTableState> {

  game: DelphsTableLogic

  onCreate (options: any) {
    this.setState(new DelphsTableState());
    this.game = new DelphsTableLogic(this.state)
    this.game.start()

    this.onMessage("updateDestination", (client, destination:{x:number,z:number}) => {
      console.log(client.sessionId, 'updateDestination', destination)
      this.game.updateDestination(client.sessionId, destination)
    });
  }

  onJoin (client: Client, options: any) {
    console.log(client.sessionId, "joined!");
    const random = generateFakeWarriors(1, client.sessionId)
    this.game.addWarrior(client.sessionId, random[0])
  }

  onLeave (client: Client, consented: boolean) {
    //TODO: handle constented
    this.game.removeWarrior(client.sessionId)
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
    this.game.stop()
  }

}
