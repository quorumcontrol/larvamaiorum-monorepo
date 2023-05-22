import { ethers } from "https://esm.sh/ethers@5.7.2";
import { providers } from "https://esm.sh/ethers@5.7.2";
import SimpleSyncher from "./SimpleSyncher.ts";

const tokenAddress = "0x05D07647d7A5a9CB08702b30e0Fe75fBbAd603fd";

export const syncer = new SimpleSyncher();

const rpcs: Record<number, { rpc: string; address?: string }> = {
  1032942172: {
    rpc: "https://mainnet.skalenodes.com/v1/haunting-devoted-deneb",
  },
  31337: {
    rpc: "http://host.docker.internal:8545",
  },
};

export const contract = (chainId: number) => {
  const provider = new providers.StaticJsonRpcProvider(rpcs[chainId].rpc);
  const signer = new ethers.Wallet(Deno.env.get("TOKEN_MINTER_PK")!).connect(
    provider,
  );
  // const token = EmpireGambitToken__factory.connect(signer, tokenAddress);

  return new ethers.Contract(
    tokenAddress,
    [
      "function mint(address to, uint256 value)",
      "function adminBurn(address acct, uint256 amount)",
    ],
    signer,
  );
};
