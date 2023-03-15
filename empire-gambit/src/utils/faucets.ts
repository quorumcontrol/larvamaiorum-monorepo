import { PoWSecure__factory } from "@/contract-types"
import { Signer } from "ethers"
import { fetchAddresses } from "./fetchAddresses"
import { mineGasForTransaction } from "./mine"

export const powFauct = (network:string) => {
  return async (address: string, signer?:Signer) => {
    const addresses = fetchAddresses(network)
    const pow = PoWSecure__factory.connect(addresses.PoWSecure.address, signer)
    const tx = await pow.pay(address)

    const gasPrice = await mineGasForTransaction(tx)
    tx.gasPrice = gasPrice
    await tx.wait()
  }
}

export const localFauct = (network:string = "localhost") => {
  return async (address:string) => {
    console.log("faucet called!", address)
    const resp = await fetch(`/api/localFaucet`, { body: JSON.stringify({ address }), method: "POST" })
    const json = await resp.json()
    console.log("resp: ", json)
  }
}
