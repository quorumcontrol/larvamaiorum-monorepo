import { BigNumber } from "ethers";
import { useQuery } from "react-query";
import mainnetProvider from "../../utils/mainnetProvider";
import { Skl__factory } from "../../../skale-token-contracts";
import { memoize } from "../../utils/memoize";

export const SKL_ADDRESS = "0x00c83aeCC790e8a4453e5dD3B0B4b3680501a7A7"

const skl = memoize(() => {
  return  Skl__factory.connect(SKL_ADDRESS, mainnetProvider());
})

const useSKLBalance = (address?: string) => {
  const fetchBalance = async () => {
    const [balance, staked] = await Promise.all([
      mainnetProvider().send("alchemy_getTokenBalances", [
        address,
        [SKL_ADDRESS],
      ]),
      skl().callStatic.getAndUpdateDelegatedAmount(address!),
    ]);
    const liquid = BigNumber.from(balance.tokenBalances[0].tokenBalance);
    console.log('liquid: ', liquid)
    return {
      staked,
      liquid,
      total: staked.add(liquid),
    };
  };
  return useQuery(["skl-balance", address], fetchBalance, {
    enabled: !!address,
  });
};

export default useSKLBalance;
