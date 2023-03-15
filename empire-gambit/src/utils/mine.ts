import crypto from "crypto"
import { BigNumber, constants, ContractTransaction, providers, utils } from "ethers";

const DIFFICULTY = BigNumber.from(1);


export async function mineGasForTransaction(tx: providers.TransactionRequest | ContractTransaction) {
  if (!tx.from || !tx.nonce || !tx.gasLimit) {
    throw new Error("Not enough fields for mining gas (from, nonce)")
  }
  let address = tx.from
  let nonce = BigNumber.from(tx.nonce)
  let gas = BigNumber.from(tx.gasLimit)
  return mineFreeGas(gas, address, nonce);
}


function mineFreeGas(gasAmount: BigNumber, address: string, nonce: BigNumber) {
  console.log('Mining free gas: ', gasAmount);
  let nonceHash = BigNumber.from(utils.solidityKeccak256(["uint256"], [nonce]))// new BN(web3.utils.soliditySha3(nonce).slice(2), 16)
  let addressHash = BigNumber.from(utils.solidityKeccak256(["address"], [address])) // new BN(web3.utils.soliditySha3(address).slice(2), 16)
  let nonceAddressXOR = nonceHash.xor(addressHash)
  let maxNumber = constants.MaxUint256.sub(1) // new BN(2).pow(new BN(256)).sub(new BN(1));
  let divConstant = maxNumber.div(DIFFICULTY);
  let candidate;
  while (true) {
    candidate = BigNumber.from(crypto.randomBytes(32).toString("hex")) // new BN(crypto.randomBytes(32).toString('hex'), 16);
    let candidateHash = BigNumber.from(utils.solidityKeccak256(["uint256"], [candidate])) //new BN(web3.utils.soliditySha3(candidate).slice(2), 16);
    let resultHash = nonceAddressXOR.xor(candidateHash);
    let externalGas = divConstant.div(resultHash)
    if (externalGas.gte(gasAmount)) {
      break;
    }
  }
  return candidate
}
