import type { NextApiRequest, NextApiResponse } from 'next'
import { handle as serverlessHandler } from '../../../serverless/mintNftClubBerlin'

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  
  const body = req.body
  const queryStringParameters = req.query

  serverlessHandler({ body, queryStringParameters }, {}, (err:any, resp:any) => {
    if (err) {
      throw err
    }
    Object.keys(resp.headers).forEach((key) => {
      res.setHeader(key, resp.headers[key])
    })
    return res.status(resp.statusCode).send(resp.body)
  })

}

export default handler
