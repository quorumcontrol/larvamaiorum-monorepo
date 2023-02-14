import { Room } from "colyseus.js";
import { createContext, useContext, useEffect, useState } from "react";
import { PickleChessState } from "../../syncing/schema/PickleChessState";

interface PlayCanvasProps {
  app: pc.Application
  room: Room<PickleChessState>
  state?: Partial<PickleChessState>
}

export const PlayCanvasApplicationContext = createContext<PlayCanvasProps>({} as any)

export const usePlayCanvasContext = () => {
  return useContext(PlayCanvasApplicationContext)
}

export const AppProvider:React.FC<PlayCanvasProps & { children: React.ReactNode }> = ({ room, app, children }) => {
  const [state, setState] = useState<Partial<PickleChessState>>(room.state.toJSON())

  useEffect(() => {
    const interval = setInterval(() => {
      setState(room.state.toJSON())
    }, 500)
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
