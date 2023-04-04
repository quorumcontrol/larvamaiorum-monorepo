import { generateCompletions } from "./textAI"

export enum GameEvent {
  started = "started",
  pieceCaptured = "pieceCaptured",
  filler = "filler",
  over = "over",
}

export interface GameState {
  event: GameEvent

  players: {
    [name: string]: {
      characters: number
    }
  },
  ranked: string[],
  gameClock: number
  timeSincePieceCapture: number
  winner?: string
}

const winningString = (state: GameState) => {
  const ranked = state.ranked
  const isTied = state.players[ranked[0]].characters === state.players[ranked[1]].characters
  if (ranked.length > 2 && isTied) {
    return `${ranked[0]} and ${ranked[1]} are tied for first place. The scores are: ${ranked.map((name) => `${name}: ${state.players[name].characters}`).join(', ')}.`
  }
  const winningString = isTied ? `the game is tied at ${state.players[ranked[0]].characters}` : `${ranked[0]} is winning.`
  return `${winningString} The scores are: ${ranked.map((name) => `${name}: ${state.players[name].characters}`).join(', ')}.`
}

const promptExtension = (state: GameState) => {
  switch (state.event) {
    case GameEvent.pieceCaptured:
      return `Please comment on the lost pieces.`
    case GameEvent.filler:
      return `It has been ${Math.floor(state.timeSincePieceCapture)} seconds since a piece was removed.`
    default:
      return ''
  }
}

const introPrompt = `
There is a game called "Empire Gambit." It is based on an ancient board game. The game is strategic like chess, but more accessible and chaotic. It is not chess and there are no pawns, or different kinds of pieces. One moves pieces around the board, trying to surround one's opponents.

You are Minerva, goddess of war and wisdom. You are a sarcastic, and high on wootgump, announcer of the game. You provide color commentary. You are *not* playing the game.
`.trim()

const endPrompt = `Write a witty one sentence commentary on the game. Only return your, short, comment.`


const getPrompt = (state: GameState, extraText: string = "") => {
  if (state.event === GameEvent.started) {
    return `
The game just started between ${state.ranked.join(', ')}. Introduce yourself and warn them that you might not make any sense due to all the wootgump you just took. Be very brief.
    `.trim()
  }

  if (state.event === GameEvent.over) {
    return `
The game is over! ${state.winner} won! ${endPrompt}
    `.trim()
  }


  return `
${state.ranked.join(', ')} are playing.

${winningString(state)}

The game has been running for ${Math.floor(state.gameClock)} seconds. Games generally last approximately 5 minutes, but are not timed..

${extraText}

${promptExtension(state)}

${endPrompt}
`.trim()
}

export const getTaunt = async (state: GameState, extraText?: string) => {
  const prompt = getPrompt(state, extraText)
  console.log("prompt: ", prompt)
  try {
    const resp = await generateCompletions({
      system: introPrompt,
      prompt,
    })
    return resp.data.choices[0].message.content
  } catch (err) {
    console.error("error fetching taunt: ", (err as any).response)
    return undefined
  }

}
