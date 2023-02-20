import assert from "assert";
import { AICharacter, AIGameState, applyAction, generateActions, shortCircuits } from "../src/ai/gamePlayer";
import BoardLogic, { Tile } from "../src/game/BoardLogic";
import { TileType } from "../src/rooms/schema/PickleChessState";

describe.only("BoardLogic", () => {

    const players = ["p1", "p2"]

    function playerPositionArgs(x:number, y:number) {
        return {
            position: { x, y },
            tileId: `tile-${x}-${y}`,
        }
    }

    const getTiles = () => {
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
        return tiles
    }

    it("kills in the corner", () => {
        const tiles = getTiles()

        const p1One:AICharacter = {
            id: "p1One",
            playerId: players[0],
            ...playerPositionArgs(0, 0),
        }
        const p1Two:AICharacter = {
            id: "p1Two",
            playerId: players[0],
            ...playerPositionArgs(3,3)
        }
        const p2One:AICharacter = {
            id: "p2One",
            playerId: players[1],
            ...playerPositionArgs(1, 0),
        }
        const p2Two:AICharacter = {
            id: "p2Two",
            playerId: players[1],
            ...playerPositionArgs(0,1),
        }

        const board = new BoardLogic<AICharacter>([p1One, p1Two, p2One, p2Two], tiles)
        assert(board.killsCharacter(board.getTile(0,0), players[0]))
    })

    it('kills in the standard up down', ( ) => {
        const tiles = getTiles()

        const p1One:AICharacter = {
            id: "p1One",
            playerId: players[0],
            ...playerPositionArgs(1, 1),
        }
        const p1Two:AICharacter = {
            id: "p1Two",
            playerId: players[0],
            ...playerPositionArgs(3,3)
        }
        const p2One:AICharacter = {
            id: "p2One",
            playerId: players[1],
            ...playerPositionArgs(1, 2),
        }
        const p2Two:AICharacter = {
            id: "p2Two",
            playerId: players[1],
            ...playerPositionArgs(1,0),
        }

        const board = new BoardLogic<AICharacter>([p1One, p1Two, p2One, p2Two], tiles)
        assert(board.killsCharacter(board.getTile(1,1), players[0]))
    })

    it('kills a line of surrounded enemies', ( ) => {
        const tiles = getTiles()

        const p1One:AICharacter = {
            id: "p1One",
            playerId: players[0],
            ...playerPositionArgs(1, 1),
        }
        const p1Two:AICharacter = {
            id: "p1Two",
            playerId: players[0],
            ...playerPositionArgs(1,2)
        }
        const p2One:AICharacter = {
            id: "p2One",
            playerId: players[1],
            ...playerPositionArgs(1, 0),
        }
        const p2Two:AICharacter = {
            id: "p2Two",
            playerId: players[1],
            ...playerPositionArgs(1,3),
        }

        const board = new BoardLogic<AICharacter>([p1One, p1Two, p2One, p2Two], tiles)
        assert(board.killsCharacter(board.getTile(1,1), players[0]))
        assert(board.killsCharacter(board.getTile(1,2), players[0]))
    })

    it('kills a line of surrounded when one side is just impassable', ( ) => {
        const tiles = getTiles()

        const p1One:AICharacter = {
            id: "p1One",
            playerId: players[0],
            ...playerPositionArgs(1, 0),
        }
        const p1Two:AICharacter = {
            id: "p1Two",
            playerId: players[0],
            ...playerPositionArgs(1,1)
        }
        const p2One:AICharacter = {
            id: "p2One",
            playerId: players[1],
            ...playerPositionArgs(1, 2),
        }
        //ignored
        const p2Two:AICharacter = {
            id: "p2Two",
            playerId: players[1],
            ...playerPositionArgs(3,3),
        }

        const board = new BoardLogic<AICharacter>([p1One, p1Two, p2One, p2Two], tiles)
        // assert(board.killsCharacter(board.getTile(1,0), players[0]))
        assert(board.killsCharacter(board.getTile(1,1), players[0]))
    })

    it("does not kill a single player when they are only on a single side", () => {
        const tiles = getTiles()

        const p1One:AICharacter = {
            id: "p1One",
            playerId: players[0],
            ...playerPositionArgs(1, 0),
        }
        const p1Two:AICharacter = {
            id: "p1Two",
            playerId: players[0],
            ...playerPositionArgs(3,2)
        }
        const p2One:AICharacter = {
            id: "p2One",
            playerId: players[1],
            ...playerPositionArgs(1, 1),
        }
        //ignored
        const p2Two:AICharacter = {
            id: "p2Two",
            playerId: players[1],
            ...playerPositionArgs(3,3),
        }

        const board = new BoardLogic<AICharacter>([p1One, p1Two, p2One, p2Two], tiles)
        // assert(board.killsCharacter(board.getTile(1,0), players[0]))
        assert(!board.killsCharacter(board.getTile(1,0), players[0]))
    })

})
