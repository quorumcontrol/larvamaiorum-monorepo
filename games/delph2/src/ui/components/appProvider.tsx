import { Room } from "colyseus.js";
import { createContext, useContext } from "react";
import { DelphsTableState } from "../../syncing/schema/DelphsTableState";

interface PlayCanvasProps {
  app: pc.Application
  room: Room<DelphsTableState>
  state?: DelphsTableState
}

export const PlayCanvasApplicationContext = createContext<PlayCanvasProps>({} as any)

export const usePlayCanvasContext = () => {
  return useContext(PlayCanvasApplicationContext)
}

export const AppProvider:React.FC<PlayCanvasProps & { children: React.ReactNode }> = ({ room, app, children }) => {
  return (
    <PlayCanvasApplicationContext.Provider value={{ app, room, state: room.state }}>
      {children}
    </PlayCanvasApplicationContext.Provider>
  )
}
