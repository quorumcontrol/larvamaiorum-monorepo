import { useDeploys } from "@/contexts/deploys"
import { useAccount, useProvider, useQuery } from "wagmi"
import { WalletDeployer__factory } from "@skaleboarder/safe-tools"

const useWalletDeployer = () => {
    const provider = useProvider()
    const { WalletDeployer: { address } } = useDeploys()

    return WalletDeployer__factory.connect(address, provider)
}

export const useSafeFromUser = () => {
    const { address, isConnected } = useAccount()
    const walletDeployer = useWalletDeployer()

    return useQuery(
        ["safeFromUser", address],
        async () => {
            return walletDeployer.ownerToSafe(address!)
        },
        {
            enabled: isConnected && !!address,
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