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

console.log("----dev----")
console.log("player tobowers: ", `https://launch.playcanvas.com/1653026?debug=true&ministats=true&m=${Buffer.from(JSON.stringify({...game, id: "0x123", name: "tobowers", avatar: "https://api.readyplayer.me/v1/avatars/63a18daedf6a9ef0482c8579.glb"})).toString("base64url")}`)
console.log("player nifab: ", `https://launch.playcanvas.com/1653026?debug=true&ministats=true&m=${Buffer.from(JSON.stringify({...game, id: "0xabc", name: "nifab", avatar: "https://api.readyplayer.me/v1/avatars/63b2a4248596abea61093458.glb"})).toString("base64url")}`)


console.log("----prod----")
console.log("player tobowers: ", `https://playcanv.as/p/SP3UNx7J/?arena=true&m=${Buffer.from(JSON.stringify({...game, id: "0x123", name: "tobowers", avatar: "https://api.readyplayer.me/v1/avatars/63a18daedf6a9ef0482c8579.glb"})).toString("base64url")}`)
console.log("player nifab: ", `https://playcanv.as/p/SP3UNx7J/?arena=true&m=${Buffer.from(JSON.stringify({...game, id: "0xabc", name: "nifab", avatar: "https://api.readyplayer.me/v1/avatars/63b2a4248596abea61093458.glb"})).toString("base64url")}`)

console.log("---- Local AI dev ---- ")
console.log("player tobowers: ", `https://launch.playcanvas.com/1653026?debug=true&ministats=true&m=${Buffer.from(JSON.stringify({...game, useAI: true, id: "0x123", name: "tobowers", avatar: "https://api.readyplayer.me/v1/avatars/63a18daedf6a9ef0482c8579.glb"})).toString("base64url")}`)

console.log("---- Server AI dev ---- ")
console.log("player tobowers: ", `https://playcanv.as/p/SP3UNx7J/?arena=true&m=${Buffer.from(JSON.stringify({...game, useAI: true, id: "0x123", name: "tobowers", avatar: "https://api.readyplayer.me/v1/avatars/63a18daedf6a9ef0482c8579.glb"})).toString("base64url")}`)
console.log("player nifab: ", `https://playcanv.as/p/SP3UNx7J/?arena=true&m=${Buffer.from(JSON.stringify({...game, useAI: true, id: "0xabc", name: "nifab", avatar: "https://api.readyplayer.me/v1/avatars/63b2a4248596abea61093458.glb"})).toString("base64url")}`)
