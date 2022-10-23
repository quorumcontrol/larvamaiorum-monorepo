import { createHash } from 'crypto'
import BN from "bn.js";

function randomInt(max: number) {
  return Math.min(Math.random() * max)
}

function deterministicNumber(id:string, seed:string) {
  const hash = createHash('sha256').update(`${id}-${seed}`).digest('hex');
  return new BN(hash, 'hex')
}

export function fakeRandomSeed() {
  return `local-seed-${randomInt(25000000)}`
}

export function deterministicBounded(size: number, id:string, seed:string) {
  const num = deterministicNumber(id, seed)
  let negative = false
  if (num.mod(new BN(2)).toNumber() == 0) {
    negative = true
  }
  // size can be a float and BigNumber doesn't like that so we first multiply it
  // then divide in javascript
  const rand = num.mod(new BN(Math.floor(size * 1_000_000))).toNumber() / 1_000_000
  return negative ? rand * -1 : rand;
}

export function deterministicRandom(max:number, id:string, seed:string) {
  if (max === 0) {
    return 0
  }
  const num = deterministicNumber(id, seed)
  // use the absolute of max to make sure we always use a positive integer for a modulo
  const rand = num.mod(new BN(Math.abs(max))).toNumber()

  // make the number negative again if max is less than zero
  return max < 0 ? (rand * -1) : rand
}
