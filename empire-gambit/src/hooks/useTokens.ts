
import { useDeploys } from "@/contexts/deploys";
import { EmpireGambitToken__factory } from "@/contract-types";
import { LarvaMaiorum__factory } from "@/larva-maiorum-types";
import { providers } from "ethers";
import { useQuery } from "react-query";
import { useAccount, useProvider } from "wagmi";

export const useTokenBalance = () => {
  const deploys = useDeploys()
  const { address, isConnected } = useAccount()
  const provider = useProvider()

  return useQuery(["token-balance", address], async () => {
    if (!isConnected || !address) return undefined

    const token = EmpireGambitToken__factory.connect(deploys.EmpireGambitToken.address, provider)
    return token.balanceOf(address)
  }, {
    enabled: isConnected && !!address
  })
}

