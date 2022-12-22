import { sdk } from "@audius/sdk"
import { memoize } from "./utils/memoize";

const audiusSdk = memoize(() => {
  return sdk({ appName: "Crypto Colosseum: Delphs Table", ethWeb3Config: (undefined as any) })
})

export interface Playable {
  title: string
  duration: number
  streaming: string

  description?: string
  artwork?: string
  artist?:string
}

export const undergroundTracks = async ():Promise<Playable[]> => {
  const tracks = await audiusSdk().tracks.getUndergroundTrendingTracks({limit: 25})
  return Promise.all(tracks.filter((t) => t.is_streamable).map(async (track) => {
    const streaming = await audiusSdk().tracks.streamTrack({trackId: track.id })
    return {
      title: track.title,
      duration: track.duration,
      streaming,

      artist: track.user.name,

      description: track.description,
      artwork: track.artwork ? (track.artwork as any)["480x480"] : undefined,
    }
  }))
}