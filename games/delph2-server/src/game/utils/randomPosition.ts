import { randomBounded } from "./randoms"

const randomPosition = () => {
  return {
    x: randomBounded(36.5),
    z: randomBounded(36.5),
  }
}

export default randomPosition
