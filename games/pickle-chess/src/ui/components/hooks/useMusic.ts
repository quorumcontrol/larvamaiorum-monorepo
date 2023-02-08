import { Music } from "../../../syncing/schema/PickleChessState"
import { usePlayCanvasContext } from "../appProvider"

const useMusic = () => {
  const { state } = usePlayCanvasContext()
  return state?.nowPlaying || {} as Partial<Music>
}

export default useMusic
