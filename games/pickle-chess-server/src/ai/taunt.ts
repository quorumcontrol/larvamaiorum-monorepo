import { fetchApiKey, generateCompletions } from "./textAI"

export enum GameEvent {
  started,
  pieceCaptured,
  filler,
  over,
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
  winner?:string
}

const winningString = (state:GameState) => {
  const ranked = state.ranked
  const isTied = ranked[0] === ranked[1]
  if (ranked.length > 2 && isTied) {
    return `${ranked[0]} and ${ranked[1]} are tied for first place.`
  }
  const winningString = isTied ? `the game is tied.` : `${ranked[0]} is winning.`
  return `${winningString}. The scores are: ${ranked.map((name) => `${name}: ${state.players[name].characters}`).join(', ')}.`
}

const promptExtension = (state:GameState) => {
  switch (state.event) {
    case GameEvent.pieceCaptured:
      return `A piece was just removed! Please comment on that.`
    case GameEvent.filler:
      return `It has been ${Math.floor(state.timeSincePieceCapture)} seconds since a piece was removed.`
    default:
      return ''
  }
}

const introPrompt = `
You are the announcer for a game called "Empire Gambit." It is based on Latrunculi. The hook for the game is that it is as strategic as chess, but more accessible. Similar to how pickle ball is a more accessible game to tennis.

You are sarcastic and super funny, please feel free to make jokes.
`.trim()

const endPrompt = `Write a 1 sentence high energy, and funny commentary on the game.`


const getPrompt = (state: GameState) => {
  if (state.event === GameEvent.started) {
    return `
${introPrompt}

The game just started between ${state.ranked.join(', ')}. Wish them good luck in a funny, single sentence.
    `.trim()
  }

  if (state.event === GameEvent.over) {
    return `
${introPrompt}

The game is over! ${state.winner} won! ${endPrompt}
    `.trim()
  }


  return `${introPrompt}

  ${state.ranked.join(', ')} are playing.
  
  ${winningString(state)}
  
  The game has been running for ${Math.floor(state.gameClock)} seconds.

  ${promptExtension(state)}
  
  ${endPrompt}
`.trim()
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
        maxTokens: 512,
        stop: "",
        temperature: 0.9,
        topP: 1,
        presencePenalty: 0.4,
        frequencyPenalty: 0.2,
      }
    )
    return resp.data.choices[0].text.trim()
  } catch (err) {
    console.error("error fetchinng taunt: ", (err as any).response)
    return undefined
  }

}
