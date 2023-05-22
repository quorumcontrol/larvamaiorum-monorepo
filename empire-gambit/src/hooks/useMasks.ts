import { LarvaMaiorum__factory } from "@/larva-maiorum-types";
import { providers } from "ethers";
import { useQuery } from "react-query";
import { useAccount } from "wagmi";


const calypsoProvider = new providers.StaticJsonRpcProvider("https://mainnet.skalenodes.com/v1/honorable-steel-rasalhague")

const larvaAddress = "0xc5c5ebfac4901cb62c497802b00864204ab0defa"

export const useMaskInventory = () => {
  const { address, isConnected } = useAccount()

  return useQuery(["mask-balance", address], async () => {
    if (!isConnected || !address) return undefined

    const maskContract = LarvaMaiorum__factory.connect(larvaAddress, calypsoProvider)

    const balance = await maskContract.balanceOf(address)

    return balance.toNumber()
  }, {
    enabled: isConnected && !!address
  })
}

