import { memoize } from "./memoize"

export const fetchAudio = memoize(() => {
  const audio = new Audio()
  audio.preload = "auto"
  audio.loop = false
  audio.crossOrigin = "anonymous";
  return audio
})

export const fetchAudioContext = memoize(() => {
  return new AudioContext()
})
