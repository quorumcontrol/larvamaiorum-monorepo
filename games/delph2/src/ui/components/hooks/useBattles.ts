import { useEffect, useState } from "react"
import { BATTLE_CHANGE } from "../../../syncing/changeEvents"
import { Battle } from "../../../syncing/schema/DelphsTableState"
import { usePlayCanvasContext } from "../appProvider"

const useBattles = () => {
  const { app, state } = usePlayCanvasContext()

  const getBattles = () => {
    if (!state) {
      return {}
    }
    const battles:Record<string,Battle> = {}
    state.battles.forEach((battle, key) => {
      battles[key] = battle
    })
    return battles
  }

  const [battles, setBattles] = useState<Record<string, Battle>>(getBattles())

  useEffect(() => {
    const onBattlesChange = () => {
      console.log('battles changed')
      setBattles(getBattles())
    }
    app.on(BATTLE_CHANGE, onBattlesChange)
    return () => {
      app.off(BATTLE_CHANGE, onBattlesChange)
    }
  }, [state, app])

  return battles
}

export default useBattles