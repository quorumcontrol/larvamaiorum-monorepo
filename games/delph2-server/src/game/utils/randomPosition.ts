import { randomBounded } from "./randoms"

const randomPosition = () => {
  return {
    x: randomBounded(27),
    z: randomBounded(27),
    // x: randomBounded(36.5),
    // z: randomBounded(36.5),
  }
}

export default randomPosition
