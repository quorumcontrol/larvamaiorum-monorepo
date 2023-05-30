import { generateCompletions } from "./textAI"

export const fetchBoard = async (numberOfPlayers:number) => {
  const numberRange = numberOfPlayers > 3 ? [15,25] : [8, 10]

  const systemPrompt = `
You are designing a top-down game board for a 3d game. There are 5 tile types:

1: grass
2: dirt
3: trees
4: water
5: stone

Each tile type has different properties and behavior, for example:
grass tiles can be walked on
dirt tiles can be be walked on
trees tiles can be walked on
water tiles cannot be walked on and are impassable.
stone tiles cannot be walked on and are impassable.

In the game, players try to surround each other's pieces on two surrounding tiles. The players may use the impassable terrain as one of the sides and so the water and stone tiles are important.

When designing the board, it's important to consider the layout and how the different tile types are used to create challenges and obstacles for the player. For example, you could use stone tiles to block the player's path, while using water tiles to force the player to find a different route. You could also use grass and dirt tiles to create beautiful patterns.

It's also important to consider the aesthetics of the board and how the tiles are used to create a visually appealing environment. For example, you could use grass and dirt tiles to create a lush, green environment, while using stone tiles to create a rocky, mountainous area.

When designing the board, it's important to balance gameplay, challenge, and aesthetics to create an engaging experience for the player.
  
You design the board by using a matrix of numbers. For example a 2x2 board with 2 stone tiles on the left and 2 water tiles on the right looks like this:
[[5,3],
[5,3]]

Stone and water tiles should be used sparingly to create obstacles and challenges for the player. Stone and water tiles should never account for greater than 20% of any row or column.

It's very important that grass, dirt, or trees tile should be reachable by every other walkable tile. For example, no row or column should be made of all water or stone tiles and no walkable area should be completely surrounded by stone or water.
  `.trim()

  const prompt = `Design a fun board with between ${numberRange[0]} and ${numberRange[1]} columns and between ${numberRange[0]} and ${numberRange[1]} rows. The board does not have to be square. Make sure all non-stone and water tiles are accessible. Only output the array, without comment.`

  try {
    console.log("fetching board")
    const resp = await generateCompletions({
      system: systemPrompt,
      prompt,
      timeout: 15_000,
    })
  
    return resp.data.choices[0].message.content  
  } catch (err) {
    console.error("error getting board from openai")
    throw err
  }

}
