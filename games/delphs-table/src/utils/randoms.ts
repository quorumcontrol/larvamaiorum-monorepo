export function randomFloat() {
  return Math.random();
}

export function randomBounded(size: number) {
  const negative = randomFloat() > 0.5;
  const rnd = randomFloat() * size;
  return negative ? rnd * -1 : rnd;
}
