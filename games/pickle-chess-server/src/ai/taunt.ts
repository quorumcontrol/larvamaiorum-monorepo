import { fetchApiKey, generateCompletions } from "./textAI"

export interface GameState {
  players: {
    [name: string]: {
      characters: number
    }
  },
  gameClock: number
  timeSincePieceCapture: number
}

const getPrompt = (state: GameState) => {
  const playerNames = Object.keys(state.players)
  const player1 = playerNames[0]
  const player2 = playerNames[1]
  const player1Score = state.players[player1].characters
  const player2Score = state.players[player2].characters
  const timeSinceLastPieceRemoved = state.timeSincePieceCapture
  const isTied = player1Score === player2Score
  const winner = player1Score > player2Score ? player1 : player2
  const loser = player1Score > player2Score ? player2 : player1

  const winningString = isTied ? `the game is tied` : `${winner} is winning`

  return `You are Minerva, god of war and wisdom, and hosting a game called "pickle chess."
  ${player1} and ${player2} are playing. The game is similar to checkers and the goal is to remove all the other player’s pieces.
  
  ${winningString} ${state.players[winner].characters} to ${state.players[loser].characters}.
  
  The game has been running for ${Math.floor(state.gameClock / 1000)} seconds.
  It has been ${Math.floor(timeSinceLastPieceRemoved / 1000)} seconds since a piece was removed.
  
  Write a 1 sentence commentary, as Minerva, to say to the two players.`.trim()
}

export const getTaunt = async (state: GameState) => {
  const prompt = getPrompt(state)
  try {
    const resp = await generateCompletions(
      prompt,
      {
        apiKey: fetchApiKey(),
        prompt,
        engine: "text-curie-001",
        maxTokens: 240,
        stop: "",
        temperature: 0.9,
        topP: 1,
        presencePenalty: 0,
        frequencyPenalty: 0,
      }
    )
    return resp.data.choices[0].text.trim()
  } catch (err) {
    console.error("error fetchinng taunt: ", err)
    return undefined
  }

}
