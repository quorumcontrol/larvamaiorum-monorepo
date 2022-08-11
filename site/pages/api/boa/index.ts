// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type OpenSeaContractLevelMetadata = {
  name: string;
  description: string;
  image: string;
  external_link: string;
  seller_fee_basis_points: number; // 2%
  fee_recipient: string; // address
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<OpenSeaContractLevelMetadata>
) {
  res.status(200).json({
    name: "Badge of Assembly",
    description: "Prove to your friends and foes just how active you are.",
    image: "external-link-url/image.png",
    external_link: "external-link-url",
    seller_fee_basis_points: 100,
    fee_recipient: "0x0832e35111431795F6D24A130BF39Fc62B387B0D",
  });
}
