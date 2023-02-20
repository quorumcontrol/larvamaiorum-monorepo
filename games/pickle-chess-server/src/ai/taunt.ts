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

  const winningString = isTied ? `the game is tied.` : `${winner} is winning.`

  let winString = ''

  if (player1Score <= 1 || player2Score <= 1) {
    winString = `The game is over. ${winner} has won!`
  }


  if (state.gameClock < 5) {
    return `
    You are providing color commentary on a game called "Empire Gambit" which is similar to Latrunculi from ancient Rome. You are sarcastic and super funny.

    The game just started between ${player1} and ${player2}. Wish them both good luck in a funny, single sentence.
    `
  }

  return `You are providing color commentary on a game called "Empire Gambit" which is similar to Latrunculi from ancient Rome. You are sarcastic and super funny.

  ${player1} and ${player2} are playing.
  
  ${winningString} ${state.players[winner].characters} to ${state.players[loser].characters}.
  
  The game has been running for ${Math.floor(state.gameClock)} seconds.
  It has been ${Math.floor(timeSinceLastPieceRemoved)} seconds since a piece was removed.
  
  ${winString}

  Write a 1 sentence commentary to say to the audience watching the game.`.trim()
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
