import localAddresses from "../contract-deployments/localhost/addresses.json"

export const fetchAddresses = (network: string = "localhost") => {
    switch (network) {
        default:
            return localAddresses
    }
}