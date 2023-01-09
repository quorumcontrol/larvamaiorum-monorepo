import { Room } from "colyseus.js";
import { createContext } from "react";
import { DelphsTableState } from "../../syncing/schema/DelphsTableState";

interface PlayCanvasProps {
  app?: pc.Application
  room?: Room<DelphsTableState>
}

const ctx = createContext<PlayCanvasProps>({})

export const PlayCanvasApplicationProvider = ctx.Provider
export const PlayCanvasApplication = ctx
