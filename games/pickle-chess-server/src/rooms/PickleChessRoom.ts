import { Room, Client } from "colyseus";
import RoomHandler from "../game/RoomHandler";
import { PickleChessState } from "./schema/PickleChessState";

export class PickleChessRoom extends Room<PickleChessState> {

  handler: RoomHandler

  onCreate (options: any) {
    this.setState(new PickleChessState());
    this.handler = new RoomHandler(this)
    this.handler.setup()
    this.setSimulationInterval((dt) => {
      this.handler.update(dt / 1000)
    }, 50)
  }

  onJoin (client: Client, options: any) {
    this.handler.handlePlayerJoin(client, options)
  }

  onLeave (client: Client, _consented: boolean) {
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
