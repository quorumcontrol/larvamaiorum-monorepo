import { Room, Client } from "colyseus";
import { DelphsTableState } from "./schema/DelphsTableState";
import DelphsTableLogic from "../game/DelphsTableLogic";
import { generateFakeWarriors } from "../game/Warrior";
import { InventoryItem } from "../game/items";

export class DelphsTable extends Room<DelphsTableState> {

  game: DelphsTableLogic

  onCreate (options: any) {
    this.setState(new DelphsTableState());
    this.game = new DelphsTableLogic(this)
    this.game.start()

    this.onMessage("updateDestination", (client, destination:{x:number,z:number}) => {
      console.log(client.sessionId, 'updateDestination', destination)
      this.game.updateDestination(client.sessionId, destination)
    });
    this.onMessage("playCard", (client, card:InventoryItem) => {
      this.game.playCard(client.sessionId, card)
    })
    this.onMessage("setTrap", (client) => {
      this.game.setTrap(client.sessionId)
    })
    this.onMessage("getLatency", (client) => {
      client.send(new Date().getTime())
    })
  }

  onJoin (client: Client, {name}: any) {
    console.log(client.sessionId, "joined!");
    const random = generateFakeWarriors(1, client.sessionId)[0]
    if (name) {
      random.name = name
    }
    this.game.addWarrior(client, random)
  }

  onLeave (client: Client, consented: boolean) {
    //TODO: handle constented
    this.game.removeWarrior(client)
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
    this.game.stop()
  }

}
