import { providers, utils } from "ethers";
import { Logger } from "ethers/lib/utils";
import networkUrls, { defaultNetwork, } from "./skaleAddresses";

utils.Logger.setLogLevel(Logger.levels.DEBUG)

export const skaleProvider = new providers.StaticJsonRpcProvider(defaultNetwork().default)
export const calypsoProvider = new providers.StaticJsonRpcProvider(networkUrls.calypso.default)

// skaleProvider.on("debug", (args) => {
//   console.log('DEBUG: ', args.action)
// })

