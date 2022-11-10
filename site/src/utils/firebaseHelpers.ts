export function addressToUid(address:string) {
  return `w:${address}`
}

const regExp = /w:(.+)/
export function uidToAddress(uid:string) {
  const matches = uid.match(regExp)
  if (!matches || !matches[1]) {
    throw new Error('not a uid')
  }
  return matches[1]
}