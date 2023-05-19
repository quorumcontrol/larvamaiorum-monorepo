import { Stripe } from "stripe"
import type { NextApiRequest, NextApiResponse } from 'next'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2022-11-15', typescript: true })

interface Resp {
  url: string
}


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Resp>
) {
  const { quantity } = JSON.parse(req.body || "{}")

  const sessionId = req.query as { sessionId: string }

  const session = await stripe.financialConnections.sessions.retrieve(sessionId.sessionId)
  
  console.log("session: ", session)

  // res.status(201).json({ url: session.url })
  // redirect to /minerva
  res.redirect(301, "/minerva")

}

