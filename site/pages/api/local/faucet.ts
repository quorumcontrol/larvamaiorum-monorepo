import type { NextApiRequest, NextApiResponse } from 'next'
import { handle as serverlessHandler } from '../../../serverless/faucet'

export default (req: NextApiRequest, res: NextApiResponse) => {
  
  const body = req.body

  serverlessHandler({ body }, {}, (err:any, resp:any) => {
    if (err) {
      throw err
    }
    res.status(resp.statusCode).json(JSON.parse(resp.body))
  })

}
