import { randomUUID } from "crypto"


const game = {
  matchId: randomUUID().toString(),
  expectedPlayers: [
    {
      id: "0x123",
    },
    {
      id: "0xabc",
    }
  ]
}

console.log("match: ", game.matchId)

console.log("player tobowers: ", `https://playcanv.as/p/3eqyo9QZ/?arena=true&m=${Buffer.from(JSON.stringify({...game, id: "0x123", name: "tobowers", avatar: "https://api.readyplayer.me/v1/avatars/63a18daedf6a9ef0482c8579.glb"})).toString("base64url")}`)
console.log("player nifab: ", `https://playcanv.as/p/3eqyo9QZ/?arena=true&m=${Buffer.from(JSON.stringify({...game, id: "0xabc", name: "nifab"})).toString("base64url")}`)
