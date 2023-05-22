import { useDeploys } from "@/contexts/deploys"
import { useAccount, useProvider, useQuery, useSigner } from "wagmi"
import { SafeSigner, WalletDeployer__factory } from "@skaleboarder/safe-tools"

const useWalletDeployer = () => {
    const provider = useProvider()
    const { WalletDeployer: { address } } = useDeploys()

    return WalletDeployer__factory.connect(address, provider)
}

export const useSafeFromUser = () => {
    const { address, isConnected } = useAccount()
    const { data:signer, isLoading, error,  } = useSigner()


    // console.log("signer: ", isConnected, signer, isLoading, error)

    return useQuery(
        ["safeFromUser", address],
        async () => {
            return (signer as SafeSigner).safeAddress()
        },
        {
            enabled: isConnected && !!signer,
        }
    )
}

export const useUserFromSafe = (safeAddr?:string) => {
    const walletDeployer = useWalletDeployer()

    return useQuery(
        ["userFromSafe", safeAddr],
        async () => {
            return walletDeployer.safeToOwner(safeAddr!)
        },
        {
            enabled: !!safeAddr
        }
    )
}