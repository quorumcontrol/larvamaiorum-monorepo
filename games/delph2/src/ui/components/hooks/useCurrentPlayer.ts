import { useContext, useEffect, useState } from "react"
import { DelphsTableState } from "../../../syncing/schema/DelphsTableState"
import { PlayCanvasApplicationContext } from "../appProvider"

const useCurrentPlayer = () => {
  const { room } = useContext(PlayCanvasApplicationContext)
  console.log('room: ', room?.sessionId)
  room?.state.warriors.forEach((w, key) => {
    console.log("session/warrior: ", key, w.name, )
  })
  return room?.state.warriors.get(room.sessionId)
}

export default useCurrentPlayer