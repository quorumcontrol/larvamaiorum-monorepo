import { useEffect, useState } from "react"
import { DelphsTableState } from "../../../syncing/schema/DelphsTableState"
import { usePlayCanvasContext } from "../appProvider"

const useMusic = () => {
  const { state } = usePlayCanvasContext()
  const [nowPlaying, setNowPlaying] = useState<Partial<DelphsTableState['nowPlaying']>>(state?.nowPlaying.toJSON() || {})

  useEffect(() => {
    if (!state) {
      return
    }

    const unsub = state.nowPlaying.listen('name', () => {
      setNowPlaying(state.nowPlaying.toJSON())
    })
    
    return unsub
  }, [state])

  return nowPlaying
}

export default useMusic
