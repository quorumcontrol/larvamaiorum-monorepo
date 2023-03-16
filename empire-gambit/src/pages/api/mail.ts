// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { isLocalhost } from '@/utils/isLocalhost';
import type { NextApiRequest, NextApiResponse } from 'next'
import Mailjet from 'node-mailjet'

type Data = {
  ok: boolean
}

const mailjet = Mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC!,
  process.env.MJ_APIKEY_PRIVATE!,
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { email } = JSON.parse(req.body)
  if (isLocalhost()) {
    console.log("localhost, not subscribing", email)
    res.status(201).json({ ok: true })
    return
  }

  console.log("subscribing", email)
  const request = mailjet
    .post("contact", { 'version': 'v3' })
    .request({
      "Name": "",
      "Email": email,
      IsExcludedFromCampaigns: true,
    })

  return request
    .then((result) => {
      console.log("result: ", result.body)
      res.status(201).json({ ok: true })
    })
    .catch((err) => {
      console.log("error: ", err.statusCode, err.body)
      res.status(500).json({ ok: false })
    })

}
