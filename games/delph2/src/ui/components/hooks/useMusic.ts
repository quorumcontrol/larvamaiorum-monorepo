import { useEffect, useState } from "react"
import { DelphsTableState, Music } from "../../../syncing/schema/DelphsTableState"
import { usePlayCanvasContext } from "../appProvider"

const useMusic = () => {
  const { state } = usePlayCanvasContext()
  return state?.nowPlaying || {} as Partial<Music>
}

export default useMusic
