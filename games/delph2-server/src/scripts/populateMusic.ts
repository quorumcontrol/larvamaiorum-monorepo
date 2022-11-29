import { sdk } from '@audius/sdk'
import { Playable } from '../game/tracks'
import { randomInt } from '../game/utils/randoms'

export type ThenArg<T> = T extends PromiseLike<infer U> ? U : T

const audiusSdk = sdk({ appName: 'Crypto Colosseum: Delphs Table', ethWeb3Config: undefined })

export const tracks = async ():Promise<Playable[]> => {
  const tracks = await audiusSdk.tracks.getUndergroundTrendingTracks({limit: 50})
  return Promise.all(tracks.filter((t) => t.is_streamable).map(async (track) => {
    const streaming = await audiusSdk.tracks.streamTrack({trackId: track.id })
    return {
      title: track.title,
      duration: track.duration,
      url: streaming,
    }
  }))
}

tracks().then((res) => {
  console.log('done', res)
}).catch((err) => {
  console.error('err', err)
})
