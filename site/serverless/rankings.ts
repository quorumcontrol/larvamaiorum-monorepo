import { S3, Endpoint } from 'aws-sdk'
import dotenv from 'dotenv'
import { rank } from '../src/utils/rankings'
import 'cross-fetch/polyfill';

dotenv.config()

const Bucket = "delphs-table-rankings"

const endpoint = new Endpoint("https://delphs-table-rankings.s3.fr-par.scw.cloud")

const s3 = new S3({
  accessKeyId: process.env.SCW_API_KEY,
  secretAccessKey: process.env.SCW_SECRET_KEY,
  region: process.env.SCW_REGION,
  s3BucketEndpoint: true,
  endpoint,
});

async function main() {
  const ranking = await rank(2054801)
  return ranking
  // const req = s3.putObject({
  //   Key: 'test',
  //   Body: JSON.stringify({hello: 'world'}),
  //   Bucket,
  // })
  // return req.promise()
}

main().then((res) => {
  console.log("res", res)
}).catch((err) => {
  console.error('err', err)
})

// export async function handle(event: any, _context: any, callback: any) {

// }