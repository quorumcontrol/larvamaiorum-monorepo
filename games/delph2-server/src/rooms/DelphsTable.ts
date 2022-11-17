import { Room, Client } from "colyseus";
import { DelphsTableState, Player } from "./schema/DelphsTableState";

export class DelphsTable extends Room<DelphsTableState> {

  onCreate (options: any) {
    this.setState(new DelphsTableState());

    this.onMessage("updateDestination", (client, {x,z}:{x:number,z:number}) => {
      console.log(client.sessionId, 'updateDestination', x, z)
      this.state.players.get(client.sessionId).destination.assign({
        x,
        z,
      })
    });

  }

  onJoin (client: Client, options: any) {
    console.log(client.sessionId, "joined!");
    this.state.players.set(client.sessionId, new Player())
  }

  onLeave (client: Client, consented: boolean) {
    //TODO: handle constented
    this.state.players.delete(client.sessionId)
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
