// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { generateCompletions } from './ai/api'
import { ChatCompletionResponseMessage } from 'openai'

type Data = {
  response: string
}

const systemPrompt = `
## DETAILS OF EMPIRE GAMBIT
Empire Gambit is based on latrunculi, but updated to be fast paced and fun.

* there are no turns, just move your players by clicking on them and then clicking where you want them to go. They will find their way there.
* If you surround your opponent on two (or more) sides capture their player. If a character cannot move and one character of their opponent is touching one of their squares, then they are also captured.
* There are grass, dirt, stone, water, and forest tiles. Characters cannot move across water or stone tiles.
## END DETAILS OF EMPIRE GAMBIT

Guide the user through three steps:
1. Get their name
2. Optionally get their email
3. Let them jump into a tutorial or design their avatar.

As soon as those steps are finished send JSON in the following format:
\`\`\`json
{
  "name": "John Doe",
  "email": "",
  "tutorial": true
}
\`\`\

Welcome the user first, but then make sure you're on track for those steps. You can answer questions about the game too.
`.trim()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChatCompletionResponseMessage | undefined>
) {
  const chatHistory = JSON.parse(req.body)
  console.log("history: ", chatHistory)
  try {
    const completion = await generateCompletions({
      system: systemPrompt,
      messages: chatHistory,
      timeout: 60_000,
    })

    console.log("response: ", completion.data.choices[0])
    return res.status(200).json(completion.data.choices[0].message)
  } catch (err: any) {
    if (err.response) {
      console.error("error with completion: ", err.response.data); // => the response payload 
    }
    console.error("error getting completion", err)
    return res.status(500).json(undefined)
  }

}
