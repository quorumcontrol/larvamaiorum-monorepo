import { createContext, useContext } from "react";
import { fetchAddresses } from "@/fetchAddresses";

const deployCtx = createContext({} as ReturnType<typeof fetchAddresses>)

export const DeployProvider = deployCtx.Provider

export const useDeploys = () => {
    return useContext(deployCtx)
}
