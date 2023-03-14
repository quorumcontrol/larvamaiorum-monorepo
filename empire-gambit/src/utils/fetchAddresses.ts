import addresses from "../contract-deployments/skale/addresses.json"

export const fetchAddresses = (network: string = "localhost") => {
    switch (network) {
        default:
            return addresses
    }
}