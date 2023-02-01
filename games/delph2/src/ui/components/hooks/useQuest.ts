import { usePlayCanvasContext } from "../appProvider"

export const useCurrentQuest = () => {
  const { state } = usePlayCanvasContext()
  return state?.currentQuest
}