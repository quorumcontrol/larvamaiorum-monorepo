import { MaxStats, Warrior } from "../../../syncing/schema/DelphsTableState"
import { usePlayCanvasContext } from "../appProvider"

const useWarriors = () => {
  const { state } = usePlayCanvasContext()

  return state?.warriors as unknown as Record<string, Warrior> | undefined
}

const useCurrentPlayer = () => {
  const { room } = usePlayCanvasContext()
  const warriors = useWarriors()
  if (!warriors) {
    return undefined
  }

  return warriors[room.sessionId]
}

export const usePlayerStats = (): { player: Partial<Warrior> | undefined, max: Partial<MaxStats> | undefined } => {
  const { state } = usePlayCanvasContext()
  const player = useCurrentPlayer()

  return {
    player,
    max: state?.maxStats
  }
}

export default useCurrentPlayer