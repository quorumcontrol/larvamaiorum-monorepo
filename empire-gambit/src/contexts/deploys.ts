import { createContext, useContext } from "react";
import { fetchAddresses } from "@/utils/fetchAddresses";

const deployCtx = createContext({} as ReturnType<typeof fetchAddresses>)

export const DeployProvider = deployCtx.Provider

export const useDeploys = () => {
    return useContext(deployCtx)
}
