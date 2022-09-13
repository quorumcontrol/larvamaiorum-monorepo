import { ethers } from "ethers";
import { chain } from "wagmi";

const mainnetProvider = new ethers.providers.AlchemyProvider(
  chain.mainnet.id,
  process.env.NEXT_PUBLIC_ALCHEMY_KEY
);

export default mainnetProvider
