import { sdk } from "@audius/sdk"
import { randomInt } from "crypto"

// export type ThenArg<T> = T extends PromiseLike<infer U> ? U : T

const audiusSdk = sdk({ appName: "Crypto Colosseum: Delphs Table", ethWeb3Config: (undefined as any) })

export interface Playable {
  title: string
  duration: number
  streaming: string

  description?: string
  artwork?: string
}

export const undergroundTracks = async ():Promise<Playable[]> => {
  const tracks = await audiusSdk.tracks.getUndergroundTrendingTracks({limit: 50})
  return Promise.all(tracks.filter((t) => t.is_streamable).map(async (track) => {
    const streaming = await audiusSdk.tracks.streamTrack({trackId: track.id })
    return {
      title: track.title,
      duration: track.duration,
      streaming,

      description: track.description,
      artworok: track.artwork?._480x480,
    }
  }))
}