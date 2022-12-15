
const game = {
  matchId: "localtest",
  expectedPlayers: [
    {
      id: "one",
    },
    {
      id: "two",
    }
  ]
}

console.log("player 1: ", Buffer.from(JSON.stringify({...game, id: "one", name: "tobowers"})).toString("base64url"))
console.log("player 2: ", Buffer.from(JSON.stringify({...game, id: "two", name: "nifab"})).toString("base64url"))