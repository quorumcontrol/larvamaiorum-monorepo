import { ethers } from "ethers";
import { chain } from "wagmi";
import { memoize } from "./memoize";

const mainnetProvider = memoize(() => {
  return new ethers.providers.AlchemyProvider(
    chain.mainnet.id,
    process.env.NEXT_PUBLIC_ALCHEMY_KEY
  );
})

export default mainnetProvider
