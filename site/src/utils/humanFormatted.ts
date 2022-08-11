import { formatFixed } from "@ethersproject/bignumber";
import { BigNumber } from "ethers";

export default function humanFormatted(value?:BigNumber, decimal = 18) {
  if (!value) {
    return '?'
  }
  return formatFixed(value.div(BigNumber.from((10**(decimal - 2)).toString())), 2)
}
