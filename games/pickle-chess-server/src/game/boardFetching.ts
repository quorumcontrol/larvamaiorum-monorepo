import { fetchBoard } from "../ai/board"
import { TileType } from "../rooms/schema/PickleChessState"

export type RawBoard = number[][]

// TODO: fetch a new board from openAI
export const getAiBoard = async ():Promise<RawBoard> => {
  return [[1,3,3,5,5,5,5,5,5,],
  [1,3,3,3,3,5,5,5,5],
  [1,1,1,1,1,2,2,2,2],
  [1,3,3,3,3,1,1,1,1],
  [1,1,1,4,4,2,2,2,2],
  [1,3,3,4,4,2,2,2,2],
  [1,3,3,4,4,1,1,1,1],
  [1,1,1,4,4,2,2,2,2],
  [1,3,3,3,3,2,2,2,2],
  [1,3,3,3,3,1,1,1,1],
  [2,1,1,1,1,2,2,2,2]]

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
  const rowLength = board[0].length

  if (!board.every((row, i) => {
    // allow the first and last row to be impassable
    if (i === 0 || i === board.length - 1) {
      return true
    }
    return row.some((tile) => tile < TileType.water)
  })) {
    console.log("invalid board, no passable tiles in any row")
    return false
  }

  // check to make sure every column except the first and last has at least one passable tile
  for (let i = 1; i < rowLength - 1; i++) {
    if (board.every((row) => {
      row[i] >= TileType.water
    })) {
      console.log("invalid board, no passable tiles in any column")
      return false
    }
  }

  return true
}
