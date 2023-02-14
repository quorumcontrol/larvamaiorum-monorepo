import { createHash, randomInt as cryptoRandomInt } from 'crypto'
import BN from "bn.js";

const LARGE_NUMBER = 1_000_000_000_000

export function randomFloat() {
  return cryptoRandomInt(LARGE_NUMBER) / LARGE_NUMBER
}

function deterministicNumber(id:string, seed:string) {
  const hash = createHash('sha256').update(`${id}-${seed}`).digest('hex');
  return new BN(hash, 'hex')
}

export function randomBounded(size: number) {
  const negative = randomFloat() > 0.5;
  const rnd = randomFloat() * size;
  return negative ? rnd * -1 : rnd;
}

export function randomInt(max:number) {
  return cryptoRandomInt(Math.floor(max))
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