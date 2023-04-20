
/**
 * 
 * @param max maximum number to return (non-inclusive)
 * @returns random number between 0 and range (non-inclusive)
 */
export function randomInt(max: number): number {
  const maxValidValue = Math.floor(0xffffffff / max) * max - 1;
  const randomArray = new Uint32Array(1);
  let randomValue;
  do {
    crypto.getRandomValues(randomArray);
    randomValue = randomArray[0];
  } while (randomValue > maxValidValue);
  return randomValue % max;
}
