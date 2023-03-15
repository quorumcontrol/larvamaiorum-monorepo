export const fetchAddresses = (network: string = "localhost") => {
    return require(`../contract-deployments/${network}/addresses.json`)
}