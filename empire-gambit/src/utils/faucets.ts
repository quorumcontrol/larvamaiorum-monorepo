import { PoWSecure__factory } from "@/contract-types"
import { Signer, utils } from "ethers"
import { fetchAddresses } from "./fetchAddresses"
import { AnonymousPoW } from "@skaleproject/pow-ethers"
import { JsonRpcProvider } from "@ethersproject/providers"

export const powFauct = (network:string) => {
  return async (address: string, signer?:Signer) => {
    if (!signer) {
      console.error("no signer for faucet")
      return
    }
    
    if ((await signer.getBalance()) > utils.parseEther("0.00001")) {
      console.log("already funded")
      return
    }  

    const addresses = fetchAddresses(network)
    const pow = PoWSecure__factory.connect(addresses.PoWSecure.address, signer!)
    const populatedTx = await pow.populateTransaction.pay(address)

    const powInstance = new AnonymousPoW({ rpcUrl: (signer.provider! as JsonRpcProvider).connection.url })
    const tx = await powInstance.send({
      to: pow.address,
      data: populatedTx.data!,
    })
    console.log("funding tx: ", tx.hash)
    await tx.wait()
    console.log("funding complete")
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
