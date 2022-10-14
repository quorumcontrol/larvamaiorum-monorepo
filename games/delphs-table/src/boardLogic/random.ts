import { createHash } from 'crypto'
import BN from "bn.js";

function randomInt(max: number) {
  return Math.min(Math.random() * max)
}

export function fakeRandomSeed() {
  return `local-seed-${randomInt(25000000)}`
}

export function deterministicRandom(max:number, id:string, seed:string) {
  if (max === 0) {
    return 0
  }
  const hash = createHash('sha256').update(`${id}-${seed}`).digest('hex');
  const num = new BN(hash, 'hex')
  // use the absolute of max to make sure we always use a positive integer for a modulo
  const rand = num.mod(new BN(Math.abs(max))).toNumber()

  // make the number negative again if max is less than zero
  return max < 0 ? (rand * -1) : rand
}
