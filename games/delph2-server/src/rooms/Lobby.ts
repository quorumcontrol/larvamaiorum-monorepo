import { Room, Client } from "colyseus";
import { LobbyState, Player, ReservationRequest } from "./schema/LobbyState";
import iterableToArray from '../game/utils/iterableToArray'
import { SimpleSyncher } from '../game/utils/singletonQueue'
import { randomUUID } from 'crypto'

export class LobbyRoom extends Room<LobbyState> {
  singleton: SimpleSyncher

  constructor(...args:any) {
    super(...args)
    this.singleton = new SimpleSyncher('lobby')
  }

  onCreate(_options: any) {
    this.setState(new LobbyState())
    this.maxClients = 70
   
    this.onMessage("reserveRoom", async (client, request:ReservationRequest) => {
      console.log('reserve room called', request)
      if (request.size === 2) {
        this.state.twoPersonWaiting.set(client.sessionId, new Player({...request, sessionId: client.sessionId}))
      }
      if (request.size === 4) {
        this.state.fourPersonWaiting.set(client.sessionId, new Player({...request, sessionId: client.sessionId}))
      }
      this.matchFolks()
    });
  }

  private matchFolks() {
    this.singleton.push(async () => {
      try {
        if (this.state.twoPersonWaiting.size > 1) {
          console.log("looking for waiting players")
          const waiting = iterableToArray(this.state.twoPersonWaiting.values())
          const rooms = waiting.map((player, i, arry) => {
            // only do every other player but allow the 0 index to get the next one
            if ((i+1) % 2 == 0) {
              return undefined
            }
            const opponent = arry[i+1]
            if (opponent) {
              return [player, opponent]
            }
            return undefined
          }).filter((val) => !!val)
          console.log('rooms', rooms)

          rooms.forEach((pairing) => {
            const [player1, player2] = pairing
            const client1 = this.clientFromSessionId(player1.sessionId)
            const client2 = this.clientFromSessionId(player2.sessionId)
            if (!client1 || !client2) {
              console.log('missing clients')
              return // don't do it if the client isn't available anymore
            }
            const game = {
              matchId: randomUUID().toString(),
              expectedPlayers: [
                {
                  id: player1.id,
                },
                {
                  id: player2.id,
                }
              ]
            }
            console.log("sending reservations")
            client1.send("reservation", Buffer.from(JSON.stringify({...game, id: player1.id, name: player1.name, avatar: player1.avatar})).toString('base64url'))
            client2.send("reservation", Buffer.from(JSON.stringify({...game, id: player2.id, name: player2.name, avatar: player2.avatar})).toString('base64url'))
            this.state.twoPersonWaiting.delete(client1.sessionId)
            this.state.twoPersonWaiting.delete(client2.sessionId)
          })
        }
      } catch(err) {
        console.error('error setting up matches', err)
        throw err
      }
    
    })  
  }

  private clientFromSessionId(sessionId:string) {
    return this.clients.find((c) => c.sessionId === sessionId)
  }

  // onAuth(_client: Client, options: JoinOptions, _request?: IncomingMessage) {
  //   console.log("on auth")
  //   if (this.state.playerCount > 0 && this.state.warriors.size >= this.state.playerCount) {
  //     console.log("player tried to join full table")
  //     return false
  //   }
  //   if (this.state.expectedPlayers.length == 0) {
  //     if (this.state.playerCount > 0 && this.state.acceptInput) {
  //       console.log("player tried to join a table already in progress")
  //       return false
  //     }
  //     return true
  //   }
  //   if (this.state.expectedPlayers && this.state.expectedPlayers.some((player) => player.id === options.id)) {
  //     return true
  //   }
  //   console.log("no states matched, false")
  //   return false
  // }

  async onJoin(client: Client) {
    console.log(client.sessionId, 'joined the lobby')
    // if (!this.state.twoPersonRoom) {
    //   const room = await matchMaker.createRoom("open-match", { playerCount: 2 })
    //   this.state.assign({
    //     twoPersonRoom: room.roomId
    //   })
    // }
    // if (!this.state.fourPersonRoom) {
    //   const room = await matchMaker.createRoom("open-match", { playerCount: 4 })
    //   this.state.assign({
    //     fourPersonRoom: room.roomId
    //   })
    // }
  }

  async onLeave(client: Client, consented: boolean) {
    this.state.twoPersonWaiting.delete(client.sessionId)
    this.state.fourPersonWaiting.delete(client.sessionId)
  }

  onDispose() {
    console.log("lobby", this.roomId, "disposing...");
  }

}
