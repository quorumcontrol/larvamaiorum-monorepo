import { Room, Client, Delayed } from "colyseus";
import RoomHandler from "../game/RoomHandler";
import { LatencyCheckMessage, Messages, PickleChessState } from "./schema/PickleChessState";

export class PickleChessRoom extends Room<PickleChessState> {

  handler: RoomHandler
  latencySender: Delayed

  onCreate (options: any) {
    this.setState(new PickleChessState());
    this.handler = new RoomHandler(this)
    this.handler.setup()
    this.setSimulationInterval((dt) => {
      this.handler.update(dt / 1000)
    }, 50)
    this.onMessage(Messages.latencyCheck, (client, message: LatencyCheckMessage) => {
      client.send(Messages.latencyCheck, message)
    })
  }

  onJoin (client: Client, options: any) {
    client.send(Messages.latencyCheck, {sentAt: Date.now()})
    this.handler.handlePlayerJoin(client, options)
  }

  onLeave (client: Client, _consented: boolean) {
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
