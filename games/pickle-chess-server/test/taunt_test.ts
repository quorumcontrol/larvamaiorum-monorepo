import { GameEvent, GameState, getTaunt } from "../src/ai/taunt"
import assert from 'assert'

describe("taunt", () => {
    it.skip('fetches a taunt', async () => {
        const state:GameState = {
            players: {
                "p1": {
                    characters: 3,
                },
                "p2": {
                    characters: 2,
                }
            },
            ranked: ["p1", "p2"],
            gameClock: 30,
            timeSincePieceCapture: 10,
            event: GameEvent.filler,
        }

        const taunt = await getTaunt(state)
        assert.ok(taunt)
        assert(taunt.length > 0)
    })
})