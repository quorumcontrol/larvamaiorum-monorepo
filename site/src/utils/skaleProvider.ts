import { providers } from "ethers";
import { defaultNetwork } from "./SkaleChains";

export const skaleProvider = new providers.StaticJsonRpcProvider(defaultNetwork().rpcUrls.default)
