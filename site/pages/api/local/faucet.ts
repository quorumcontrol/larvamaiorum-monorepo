import type { NextApiRequest, NextApiResponse } from 'next'
import { handle as serverlessHandler } from '../../../serverless/faucet'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  
  const body = req.body

  await serverlessHandler({ body }, {}, (err:any, resp:any) => {
    if (err) {
      throw err
    }
    res.status(resp.statusCode).json(JSON.parse(resp.body))
  })

}

export default handler
