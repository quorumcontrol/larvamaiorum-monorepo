import { buildInput, prompt } from "../src/minerva"
import { generateCompletions } from "../src/textAI"
import dotenv from 'dotenv'

dotenv.config()

const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("missing api key")
}

const main = async () => {
//   const input = buildInput([{
//     speaker: "topper",
//     msg: "hello?"
//   },
// {
//   speaker: "minerva",
//   msg: `Welcome! It is a pleasure to meet you. I am Minerva, goddess of wisdom and war. My temple is a place of solace and reflection, a refuge for those seeking knowledge and insight. I'm here to guide and protect, so please tell me, what brings you on this journey?`
// }, {
//   speaker: "topper",
//   msg: "I want to know if the redsox will win tomorrow."
// }, {
//   speaker: "minerva",
//   msg: "I'm sorry, but I cannot answer that question. It is not the kind of knowledge I can provide. Instead, I suggest that you focus your energies on more meaningful questions and pursuits"
// }, {
//   speaker: "topper",
//   msg: "rude. but fine... what color best represents the universe?"
// }, {
//   speaker: "minerva",
//   msg: "What an interesting question! The color that best represents the universe truly depends on what one chooses to focus on. I find comfort in the cosmic blues and purples of the night sky. Others may prefer the vibrant oranges and reds of the dawn. Whatever color you choose, it should be one that you find brings you joy and peace, for that is what the universe is all about."
// }, {
//   speaker: "topper",
//   msg: "will you drop some alpha and let me know when Delph's Table is going to come out?"
// }])

  // const userPrompt = `${prompt}\n${JSON.stringify(input)}`

  const userPrompt = `
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

Design a fun board with between 9 and 15 columns and between 11 and 14 rows. 
  `.trim()

  const resp = await generateCompletions(
    userPrompt,
    {
      apiKey,
      prompt: userPrompt,
      engine: "text-davinci-003",
      maxTokens: 1024,
      stop: "",
      temperature: 0.8,
      topP: 1,
      presencePenalty: 0,
      frequencyPenalty: 0,
    }
  )

  return resp.data

}

main().then((res) => {
  console.log("res: ", res)
  process.exit(0)
}).catch((err) => {
  console.error("err:", (err as any).response.data)
  process.exit(1)
})