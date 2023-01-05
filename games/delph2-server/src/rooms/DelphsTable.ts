import { Room, Client } from "colyseus";
import { DelphsTableState, Player, RoomType } from "./schema/DelphsTableState";
import DelphsTableLogic from "../game/DelphsTableLogic";
import { generateFakeWarriors } from "../game/Warrior";
import { InventoryItem } from "../game/items";
import { IncomingMessage } from "http";
import { randomInt } from "../game/utils/randoms";

interface JoinOptions {
  name?: string
  id?: string
  token?: string
  avatar?: string
}

interface RoomOptions extends JoinOptions {
  roomType: RoomType

  matchId?: string
  expectedPlayers?: JoinOptions[]
  playerCount?: number
}

export class DelphsTable extends Room<DelphsTableState> {

  game: DelphsTableLogic

  onCreate(options: RoomOptions) {
    console.log(this.roomId, this.roomName, "oncreate called: ", options)
    this.setState(new DelphsTableState({matchId: options.matchId}))
    this.state.assign({
      acceptInput: false,
      seed: randomInt(100_000).toString(),
      playerCount: options.playerCount, // can be undefined and that's ok
      roomType: options.roomType,
    })

    if (options.playerCount) {
      this.maxClients = options.playerCount
    }

    if (options.expectedPlayers) {
      this.setPrivate(true)
      console.log('creating with expected players')
      this.state.expectedPlayers.push(...options.expectedPlayers.map((player) => new Player(player)))
    }

    this.game = new DelphsTableLogic(this)
    this.game.start()
    this.setSimulationInterval((dt) => {
      console.log('up: ', dt / 1000)
      this.game.update(dt / 1000)
    }, 75)

    this.onMessage("updateDestination", (client, destination: { x: number, z: number }) => {
      console.log(client.sessionId, 'updateDestination', destination)
      this.game.updateDestination(client.sessionId, destination)
    });
    this.onMessage("playCard", (client, card: InventoryItem) => {
      this.game.playCard(client.sessionId, card)
    })
    this.onMessage("getLatency", (client) => {
      client.send(new Date().getTime())
    })
  }

  onAuth(_client: Client, options: JoinOptions, _request?: IncomingMessage) {
    console.log("on auth")
    if (this.state.playerCount > 0 && this.state.warriors.size >= this.state.playerCount) {
      console.log("player tried to join full table")
      return false
    }
    if (this.state.expectedPlayers.length == 0) {
      if (this.state.playerCount > 0 && this.state.acceptInput) {
        console.error("player tried to join a table already in progress", this.state.playerCount, this.state.warriors.size, this.state.acceptInput)
        return false
      }
      return true
    }
    if (this.state.expectedPlayers && this.state.expectedPlayers.some((player) => player.id === options.id)) {
      return true
    }
    console.log("no states matched, false")
    return false
  }

  onJoin(client: Client, { name, avatar }: JoinOptions) {
    console.log(this.roomId, client.sessionId, "joined!");
    const random = generateFakeWarriors(1, client.sessionId)[0]
    if (name) {
      random.name = name
    }
    if (avatar) {
      random.avatar = avatar
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
