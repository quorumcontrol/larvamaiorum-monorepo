import { Room } from "colyseus.js";
import { createContext, useEffect, useState } from "react";
import { DelphsTableState } from "../../syncing/schema/DelphsTableState";

interface PlayCanvasProps {
  app: pc.Application
  room: Room<DelphsTableState>
  state?: DelphsTableState
}

export const PlayCanvasApplicationContext = createContext<PlayCanvasProps>({} as any)

export const AppProvider:React.FC<PlayCanvasProps & { children: React.ReactNode }> = ({ room, app, children }) => {
  const [val, setVal] = useState<PlayCanvasProps>({app, room, state:room.state})

  useEffect(() => {
    app.on('stateChange', (state:DelphsTableState) => {
      setVal({app, room, state})
    })
  }, [app])

  return (
    <PlayCanvasApplicationContext.Provider value={val}>
      {children}
    </PlayCanvasApplicationContext.Provider>
  )
}
