import assert from "assert";
import { AICharacter, AIGameState, applyAction, generateActions, shortCircuits } from "../src/ai/gamePlayer";
import BoardLogic, { Tile } from "../src/game/BoardLogic";
import { TileType } from "../src/rooms/schema/PickleChessState";

describe.only("AI Logic", () => {

    it("short circuits correctly", () => {
        const tiles: Tile[] = []
        for (let y = 0; y <= 3; y++) {
            for (let x = 0; x <= 3; x++) {
                tiles.push({
                    x,
                    y,
                    type: TileType.grass,
                    id: `tile-${x}-${y}`,
                })
            }
        }
        assert.equal(tiles.length, 16)

        const players = ["p1", "p2"]
        const p1One:AICharacter = {
            id: "p1One",
            playerId: players[0],
            position: { x: 1, y: 0},
            tileId: "tile-1-0",
        }
        const p1Two:AICharacter = {
            id: "p1Two",
            playerId: players[0],
            position: { x: 2, y: 2 },
            tileId: "tile-2-2",
        }
        const p2One:AICharacter = {
            id: "p2One",
            playerId: players[1],
            position: { x: 1, y: 1 },
            tileId: "tile-1-1",
        }
        const p2Two:AICharacter = {
            id: "p2Two",
            playerId: players[1],
            position: { x: 3, y: 3 },
            tileId: "tile-3-3",
        }

        const board = new BoardLogic<AICharacter>([p1One, p1Two, p2One, p2Two], tiles)

        assert(board.isPassable(players[0], board.getTile(1,2)))

        const state:AIGameState = {
            board,
            characters: [p1One, p1Two, p2One, p2Two],
            players,
            player: 0,
        }

        const actions = generateActions(state)
        assert.equal(actions.length, 12)

        const newState = applyAction(state, { playerId: 'p1', from: { x: 2, y: 2 }, to: { x: 2, y: 1 } })
        console.log(newState)

        const circuited = shortCircuits(state, actions, players[0])
        console.log(circuited)
        assert.equal(circuited.length, 1)

    })

})
