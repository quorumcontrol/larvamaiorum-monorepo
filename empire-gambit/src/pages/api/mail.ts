// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { isLocalhost } from '@/utils/isLocalhost';
import type { NextApiRequest, NextApiResponse } from 'next'
import Mailjet, { Contact, LibraryResponse } from 'node-mailjet'

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
  const request:Promise<LibraryResponse<Contact.PostContactResponse>> = mailjet
    .post("contact", { 'version': 'v3' })
    .request({
      "Name": "",
      "Email": email,
      IsExcludedFromCampaigns: true,
    })

  try {

    const result = await request
    console.log("result: ", result.body)
    res.status(201).json({ ok: true })
    return

  } catch (err: any) {
    console.log("error posting email: ", err.statusCode, err.body)

    try {
      // now check to see if the email already exists
      const exists:LibraryResponse<Contact.GetContactResponse> = await mailjet.get("contact", { 'version': 'v3' }).request({
        contact_ID: email
      })
      if (exists.body.Count > 0) {
        console.log("email already exists, that's ok")
        res.status(201).json({ ok: true })
        return
      }
    } catch (err: any) {

      console.error("error fetching email", err.statusCode, err.body)
      res.status(500).json({ ok: false })
      return
    }

  }

}
