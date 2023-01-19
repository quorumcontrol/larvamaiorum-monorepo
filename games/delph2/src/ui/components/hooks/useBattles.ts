import { Battle } from "../../../syncing/schema/DelphsTableState"
import { usePlayCanvasContext } from "../appProvider"

const useBattles = () => {
  const { app, state } = usePlayCanvasContext()

  return state?.battles as unknown as Record<string,Battle> | undefined
}

export default useBattles