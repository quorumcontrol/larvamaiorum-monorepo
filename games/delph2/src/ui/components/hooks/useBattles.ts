import { Battle } from "../../../syncing/schema/DelphsTableState"
import { usePlayCanvasContext } from "../appProvider"

const useBattles = () => {
  const { state } = usePlayCanvasContext()

  return state?.battles as unknown as Record<string,Battle> | undefined
}

export default useBattles