import { Room, Client } from "colyseus";
import { DelphsTableState, Player, RoomType } from "./schema/DelphsTableState";
import DelphsTableLogic from "../game/DelphsTableLogic";
import { generateFakeWarriors } from "../game/Warrior";
import { InventoryItem } from "../game/items";
import { IncomingMessage } from "http";

interface JoinOptions {
  name?: string
  id?: string
  token?: string
}

interface RoomOptions extends JoinOptions {
  roomType: RoomType

  matchId?: string
  expectedPlayers?: JoinOptions[]
}

export class DelphsTable extends Room<DelphsTableState> {

  game: DelphsTableLogic

  onCreate(options: RoomOptions) {
    this.setState(new DelphsTableState({matchId: options.matchId}))

    if (options.expectedPlayers) {
      console.log('creating with expected players')
      this.state.expectedPlayers.push(...options.expectedPlayers.map((player) => new Player(player)))
    } else {
      console.log('normal create')
    }

    this.state.assign({
      roomType: options.roomType,
    })

    this.game = new DelphsTableLogic(this)
    this.game.start()

    this.onMessage("updateDestination", (client, destination: { x: number, z: number }) => {
      console.log(client.sessionId, 'updateDestination', destination)
      this.game.updateDestination(client.sessionId, destination)
    });
    this.onMessage("playCard", (client, card: InventoryItem) => {
      this.game.playCard(client.sessionId, card)
    })
    this.onMessage("setTrap", (client) => {
      this.game.setTrap(client.sessionId)
    })
    this.onMessage("getLatency", (client) => {
      client.send(new Date().getTime())
    })
  }

  onAuth(_client: Client, options: JoinOptions, _request?: IncomingMessage) {
    console.log("on auth")
    if (this.state.expectedPlayers.length == 0) {
      return true
    }
    if (this.state.expectedPlayers && this.state.expectedPlayers.some((player) => player.id === options.id)) {
      return true
    }
    console.log("no states matched, false")
    return false
  }

  onJoin(client: Client, { name }: JoinOptions) {
    console.log(client.sessionId, "joined!");
    const random = generateFakeWarriors(1, client.sessionId)[0]
    if (name) {
      random.name = name
    }
    this.game.addWarrior(client, random)
  }

  async onLeave(client: Client, consented: boolean) {
    try {
      if (consented) {
          throw new Error("consented leave");
      }
  
      await this.allowReconnection(client, 10); // 2nd parameter is seconds
  
    } catch (e) {
      this.game.removeWarrior(client)
    }
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
    this.game.stop()
  }

}
