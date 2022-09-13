import type { NextApiRequest, NextApiResponse } from 'next'
import { handle as serverlessHandler } from '../../../../serverless/claimor'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  
  const body = req.body

  await serverlessHandler({ body }, {}, (err:any, resp:any) => {
    if (err) {
      console.error('throwing error', err)
      throw err
    }
    res.status(resp.statusCode).json(JSON.parse(resp.body))
    return
  })

}

export default handler
