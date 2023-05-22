import { memoize } from "./memoize"

export const fetchAudioContext = memoize(() => {
  return new AudioContext()
})
