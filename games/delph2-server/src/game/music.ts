import fetch from 'cross-fetch'

interface Playable {
  title: string
  duration: number
  streaming: string

  description?: string
  artwork?: string
}

const url = "https://us-central1-realtimedelphs.cloudfunctions.net/randomTrack"

export const getRandomTrack = async ():Promise<Playable> => {
  const resp = await fetch(url)
  const track:Playable = await resp.json()
  return track
}
