
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

    console.log("safe addr: ", safeAddr)

    const token = EmpireGambitToken__factory.connect(deploys.EmpireGambitToken.address, provider)
    const balance = await token.balanceOf(safeAddr)

    console.log("balance", balance.toString())
    return balance
  }, {
    enabled: !!safeAddr
  })
}

