import { buildInput, prompt } from "../src/minerva"
import { generateCompletions } from "../src/textAI"
import dotenv from 'dotenv'

dotenv.config()

const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("missing api key")
}

const main = async () => {
  const input = buildInput([{
    speaker: "topper",
    msg: "hello?"
  },
{
  speaker: "minerva",
  msg: `Welcome! It is a pleasure to meet you. I am Minerva, goddess of wisdom and war. My temple is a place of solace and reflection, a refuge for those seeking knowledge and insight. I'm here to guide and protect, so please tell me, what brings you on this journey?`
}, {
  speaker: "topper",
  msg: "I want to know if the redsox will win tomorrow."
}, {
  speaker: "minerva",
  msg: "I'm sorry, but I cannot answer that question. It is not the kind of knowledge I can provide. Instead, I suggest that you focus your energies on more meaningful questions and pursuits"
}, {
  speaker: "topper",
  msg: "rude. but fine... what color best represents the universe?"
}, {
  speaker: "minerva",
  msg: "What an interesting question! The color that best represents the universe truly depends on what one chooses to focus on. I find comfort in the cosmic blues and purples of the night sky. Others may prefer the vibrant oranges and reds of the dawn. Whatever color you choose, it should be one that you find brings you joy and peace, for that is what the universe is all about."
}, {
  speaker: "topper",
  msg: "will you drop some alpha and let me know when Delph's Table is going to come out?"
}])

  const userPrompt = `${prompt}\n${JSON.stringify(input)}`

  const resp = await generateCompletions(
    userPrompt,
    {
      apiKey,
      prompt: userPrompt,
      engine: "text-davinci-003",
      maxTokens: 1536,
      stop: "###",
      temperature: 0.8,
      topP: 1,
      presencePenalty: 0.6,
      frequencyPenalty: 0,
    }
  )

  return resp.data

}

main().then((res) => {
  console.log("res: ", res)
  process.exit(0)
}).catch((err) => {
  console.error("err:", err)
  process.exit(1)
})