import { AStarFinder } from "astar-typescript"
import { fetchBoard } from "../ai/board"
import { TileType } from "../rooms/schema/PickleChessState"

export type RawBoard = number[][]

// TODO: fetch a new board from openAI
export const getAiBoard = async ():Promise<RawBoard> => {
  const aiResponse = await fetchBoard()
  const text = aiResponse.choices[0].text
  console.log("ai response: ", text)
  const board = JSON.parse(text.trim())
  if (!validateBoard(board)) {
    return getAiBoard()
  }
  return board 
}

const validateBoard = (board: RawBoard) => {
  // first of all make sure all rows and columns have one passable
  const rows = board[0].length

  if (!board.every((row) => {
    return row.some((tile) => tile < TileType.water)
  })) {
    console.log("invalid board, no passable tiles in any row")
    return false
  }

  // check to make sure every column has a passable tile
  for (let i = 0; i < rows; i++) {
    if (board.every((row) => {
      row[i] >= TileType.water
    })) {
      console.log("invalid board, no passable tiles in any column")
      return false
    }
  }

  return true

  // const aStar = new AStarFinder({
  //   grid: {
  //     matrix: board.map((column) => column.map((tile) => {
  //       if ([TileType.water, TileType.stone].includes(tile)) {
  //         return 1
  //       }
  //       return 0
  //     })),
  //   },
  // })

  // // make sure you can always get from one end of the board to the other

}
