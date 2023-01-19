import { Room } from "colyseus.js";
import { createContext, useContext, useEffect, useState } from "react";
import { DelphsTableState } from "../../syncing/schema/DelphsTableState";

interface PlayCanvasProps {
  app: pc.Application
  room: Room<DelphsTableState>
  state?: Partial<DelphsTableState>
}

export const PlayCanvasApplicationContext = createContext<PlayCanvasProps>({} as any)

export const usePlayCanvasContext = () => {
  return useContext(PlayCanvasApplicationContext)
}

export const AppProvider:React.FC<PlayCanvasProps & { children: React.ReactNode }> = ({ room, app, children }) => {
  const [state, setState] = useState<Partial<DelphsTableState>>(room.state.toJSON())

  useEffect(() => {
    const interval = setInterval(() => {
      setState(room.state.toJSON())
    }, 250)
    return () => {
      clearInterval(interval)
    }
  }, [room])

  return (
    <PlayCanvasApplicationContext.Provider value={{ app, room, state: state }}>
      {children}
    </PlayCanvasApplicationContext.Provider>
  )
}
