import { app } from "playcanvas"
import { useEffect, useState } from "react"
import { WARRIOR_CHANGE } from "../../../syncing/changeEvents"
import { Warrior } from "../../../syncing/schema/DelphsTableState"
import { usePlayCanvasContext } from "../appProvider"

const useWarriors = () => {
  const { app, state } = usePlayCanvasContext()

  const getWarriors = () => {
    console.log("use battles re-executing")
    if (!state) {
      return {}
    }
    const warriors:Record<string,Warrior> = {}
    state.warriors.forEach((warrior, key) => {
      warriors[key] = warrior
    })
    return warriors
  }

  const [warriors, setWarriors] = useState<Record<string, Warrior>>(getWarriors())

  useEffect(() => {
    const onWarriorChange = () => {
      console.log('warriors changed')
      setWarriors(getWarriors)
    }
    app.on(WARRIOR_CHANGE, onWarriorChange)
    return () => {
      app.off(WARRIOR_CHANGE, onWarriorChange)
    }
  }, [state])

  return warriors
}

const useCurrentPlayer = () => {
  const { room } = usePlayCanvasContext()
  const warriors = useWarriors()
  console.log('room: ', room?.sessionId)
  return warriors[room.sessionId]
}

export default useCurrentPlayer