import { providers, utils } from "ethers";
import { Logger } from "ethers/lib/utils";
import { defaultNetwork } from "./SkaleChains";

utils.Logger.setLogLevel(Logger.levels.DEBUG)

export const skaleProvider = new providers.StaticJsonRpcProvider(defaultNetwork().rpcUrls.default)

// skaleProvider.on("debug", (args) => {
//   console.log('DEBUG: ', args.action)
// })

