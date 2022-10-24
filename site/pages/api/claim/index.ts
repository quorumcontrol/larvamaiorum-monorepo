// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { BigNumber, Wallet } from "ethers";
import { parseEther } from "ethers/lib/utils";
import type { NextApiRequest, NextApiResponse } from "next";
import { Skl__factory } from '../../../skale-token-contracts'
import { SKL_ADDRESS } from "../../../src/hooks/badgeOfAssembly/useSKLBalance";
import { badgeOfAssemblyContract } from "../../../src/utils/contracts";
import mainnetProvider from "../../../src/utils/mainnetProvider";
import { skaleProvider } from "../../../src/utils/skaleProvider";

if (!process.env.BADGE_MINTER_PRIVATE_KEY) {
  throw new Error("must have a badge minter private key")
}

const skl = Skl__factory.connect(SKL_ADDRESS, mainnetProvider())

const schainSigner = new Wallet(process.env.BADGE_MINTER_PRIVATE_KEY!).connect(skaleProvider)
const boa = badgeOfAssemblyContract().connect(schainSigner)

const fetchBalance = async (address: string) => {
  console.log('fetch balance for: ', address)
  const balance = await mainnetProvider().send('alchemy_getTokenBalances', [address, [SKL_ADDRESS]])
  return BigNumber.from(balance.tokenBalances[0].tokenBalance)
}

const threshold = parseEther('1000')

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{transactionId?: string}>
) {
  // return res.status(201).json({});
  const address = JSON.parse(req.body).address
  const [balance,stakedBalance] = await Promise.all([
    fetchBalance(address),
    skl.callStatic.getAndUpdateDelegatedAmount(address),
  ])
  if (balance.add(stakedBalance).gte(threshold)) {
    // fake succeeding transaction:
    // return res.status(201).json({ transactionId: '0xae42443d5b97530465d8a513c19a4f27b25cd7708f37da4d648fda557ced8c9a'})
    const tx = await boa.mint(address, 1, 1)
    console.log('to', address,'txid: ', tx.hash)
    return res.status(201).json({ transactionId: tx.hash })
  }
  res.status(401);
}
