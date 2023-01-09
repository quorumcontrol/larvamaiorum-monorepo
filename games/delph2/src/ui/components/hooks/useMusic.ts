import { useContext, useEffect, useState } from "react"
import { DelphsTableState } from "../../../syncing/schema/DelphsTableState"
import { PlayCanvasApplication } from "../appProvider"

const useMusic = () => {
  const { room } = useContext(PlayCanvasApplication)
  const [nowPlaying, setNowPlaying] = useState<Partial<DelphsTableState['nowPlaying']>>(room?.state.nowPlaying.toJSON() || {})

  useEffect(() => {
    if (!room) {
      return
    }

    room.state.nowPlaying.onChange = () => {
      setNowPlaying(room.state.nowPlaying.toJSON())
    }
  }, [room])

  return nowPlaying
}

export default useMusic