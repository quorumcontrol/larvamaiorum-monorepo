// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Wallet } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";
import { isTxEuropaSkalePurchase } from "../../../src/hooks/badgeOfAssembly/europaChain";
import { badgeOfAssemblyContract } from "../../../src/utils/contracts";
import { skaleProvider } from "../../../src/utils/skaleProvider";

if (!process.env.BADGE_MINTER_PRIVATE_KEY) {
  throw new Error("must have a badge minter private key")
}

const schainSigner = new Wallet(process.env.BADGE_MINTER_PRIVATE_KEY!).connect(skaleProvider)

const boa = badgeOfAssemblyContract().connect(schainSigner)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{transactionId?: string}>
) {
  // return res.status(201).json({});
  const { address, txHash } = JSON.parse(req.body)

  if (await isTxEuropaSkalePurchase(address, txHash)) {
    // fake succeeding transaction:
    // return res.status(201).json({ transactionId: '0xae42443d5b97530465d8a513c19a4f27b25cd7708f37da4d648fda557ced8c9a'})
    const tx = await boa.mint(address, 2, 1)
    console.log('ruby badge', 'to', address,'txid: ', tx.hash)
    return res.status(201).json({ transactionId: tx.hash })
  }
  res.status(401);
}


