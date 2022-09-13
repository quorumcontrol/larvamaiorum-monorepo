import type { NextApiRequest, NextApiResponse } from 'next'
import { handle as serverlessHandler } from '../../../../serverless/claimor'

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  
  const body = req.body

  serverlessHandler({ body }, {}, (err:any, resp:any) => {
    if (err) {
      console.error('throwing error', err)
      throw err
    }
    res.status(resp.statusCode).json(JSON.parse(resp.body))
  })

}

export default handler
