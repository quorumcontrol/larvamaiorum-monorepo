import eligibleAddresses from './goodGhostingAddresses'


export async function handle(event: any, _context: any, callback: any) {
  const { address:reqAddr } = JSON.parse(event.body)
  const address:string = reqAddr

  return callback(null, {
    statusCode: 200,
    body: JSON.stringify({
      address,
      eligible: eligibleAddresses.includes(address.toLowerCase())
    }),
  })
}
