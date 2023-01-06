import { createContext } from "react";

const ctx = createContext<pc.Application | undefined>(undefined)

export const PlayCanvasApplicationProvider = ctx.Provider
export const PlayCanvasApplication = ctx