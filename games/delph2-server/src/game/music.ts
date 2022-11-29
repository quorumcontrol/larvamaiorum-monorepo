import tracks, { Playable } from './tracks'
import { randomInt } from './utils/randoms'

export const getRandomTrack = async ():Promise<Playable> => {
  return tracks[randomInt(tracks.length)]
}
