
import { useDeploys } from "@/contexts/deploys";
import { EmpireGambitToken__factory } from "@/contract-types";
import { useQuery } from "react-query";
import { useProvider } from "wagmi";
import { useSafeFromUser } from "./useSafe";

export const useTokenBalance = () => {
  const deploys = useDeploys()
  const { data: safeAddr } = useSafeFromUser()
  const provider = useProvider()

  return useQuery(["token-balance", safeAddr], async () => {
    if (!safeAddr) return undefined

    const token = EmpireGambitToken__factory.connect(deploys.EmpireGambitToken.address, provider)
    return token.balanceOf(safeAddr)
  }, {
    enabled: !!safeAddr
  })
}

