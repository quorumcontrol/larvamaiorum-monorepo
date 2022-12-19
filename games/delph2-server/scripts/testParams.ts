
const game = {
  matchId: "cryptocolosseumtestroom",
  expectedPlayers: [
    {
      id: "0x123",
    },
    {
      id: "0xabc",
    }
  ]
}

console.log("player 1: ", Buffer.from(JSON.stringify({...game, id: "0x123", name: "tobowers"})).toString("base64url"))
console.log("player 2: ", Buffer.from(JSON.stringify({...game, id: "0xabc", name: "nifab"})).toString("base64url"))