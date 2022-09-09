import { DateTime } from 'luxon'
import { playerCount } from '../src/utils/rankings'

async function main() {
  console.log(await playerCount(DateTime.now(), 'day'))
}

main().then(() => {
  console.log('done')
}).catch((err) => {
  console.error('err: ', err)
})