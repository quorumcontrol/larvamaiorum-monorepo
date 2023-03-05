import { generateCompletions } from "./textAI"

export const fetchBoard = async () => {
  const systemPrompt = `
You are designing a top-down level for a 3d game. There are 5 tile types:

1: grass
2: dirt
3: trees
4: water
5: stone

Each tile type has different properties and behavior, for example:
Grass tiles can be walked on and provide cover for characters in the game.
Dirt tiles can also be walked on and provide less cover than grass tiles.
Trees tiles cannot be walked through, they are tall.
Water tiles cannot be walked on and are impassable.
Stone tiles cannot be walked on and are impassable.

When designing the level, it's important to consider the layout and how the different tile types can be used to createchallenges and obstacles for the player. For example, you could use stone tiles to block the player's path, whileusing water tiles to force the player to find a different route. You could also use grass and dirt tiles to create amaze-like environment that the player must navigate.

It's also important to consider the aesthetics of the level and how the different tile types can be used to create a visually appealing environment. For example, you could use grass and dirt tiles to create a lush, green environment,while using stone tiles to create a rocky, mountainous area. The patternss should not be geometric.

Overall, when designing a top-down level, it's important to balance gameplay, challenge, and aesthetics to create an enjoyable and engaging experience for the player.
  
You design the board by using a matrix of numbers. For example a 2x2 board with 2 stone tiles on the left and 2 water tiles on the right looks like this:
[[5,3],
[5,3]]

There should never be a a part of the board that is unreachable. For example, no row or column should be made of all water or stone tiles. Additionally water or stone tiles should never create a square or box on the board. Stone and water tiles should never account for greater than 20% of any row or column.

Stone and water tiles should be used sparingly to create obstacles and challenges for the player.
  `.trim()

  const prompt = `Design a fun board with between 8 and 12 columns and between 8 and 12 rows. Only output the array, without comment.`

  const resp = await generateCompletions({
    system: systemPrompt,
    prompt,
  })

  return resp.data.choices[0].message.content

}
