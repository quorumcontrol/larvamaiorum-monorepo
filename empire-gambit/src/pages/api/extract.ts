// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { generateCompletions } from './ai/api'
import { ChatCompletionResponseMessage } from 'openai'

enum ExtractionType {
  email = "email",
  name = "name",
  avatarOrTutorial = "avatarOrTutorial",
}

const systemPrompt = (extractionType: ExtractionType) => {
  return `
You are a helpful NLP processing bot outputs JSON only.
`.trim()
//   switch (extractionType) {
//     case ExtractionType.email:
//       return `
// You are a helpful NLP processing bot outputs JSON only.
// `.trim()
//     default:
//       throw new Error("unknown extraction type")
//   }

}

const userMessage = (extractionType: ExtractionType, userMessage:string) => {
  switch (extractionType) {
    case ExtractionType.email:
      return `
Please extract the email address from this text. It's possible the user is asking to not share their email.
---
${userMessage}
---
If the user did not provide an email then skip is true.
Respond with only JSON that looks like this:
{
  "email": "<user email>",
  "skip": false
}
`
    case ExtractionType.name:
      return `
Please extract the name from this text:
---
${userMessage}
---
If you cannot extract the name then parseable is false.
Respond with only JSON that looks like this:
{
  "name": "<user name>",
  "parseable": true
}
`
  case ExtractionType.avatarOrTutorial:
    return `
The user was just asked: "Would you like to build your avatar now or jump right into a tutorial?"
Please extract whether or not the user wants to setup their avatar or go straight into a tutorial (skipping their avatar creation).
---
${userMessage}
---
Respond with only JSON that looks like this:
{
  "avatar": true,
  "tutorial": false
}
` 
  default:
      throw new Error("unknown extraction type")
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChatCompletionResponseMessage | undefined>
) {
  const { extractionType, content } = JSON.parse(req.body)
  console.log("extract: ", extractionType, content)
  try {
    const completion = await generateCompletions({
      system: systemPrompt(extractionType),
      messages: [{
        role: "user",
        content: userMessage(extractionType, content),
      }],
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
